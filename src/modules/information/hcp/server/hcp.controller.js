const path = require('path');
const _ = require('lodash');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const validator = require('validator');
const { QueryTypes, Op, where, col, fn } = require('sequelize');
const Hcp = require('./hcp-profile.model');
const DatasyncHcp = require('./datasync-hcp-profile.model');
const archiveService = require(path.join(process.cwd(), 'src/modules/core/server/archive/archive.service'));
const HcpConsents = require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-consents.model'));
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));
const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model'));
const ConsentLocale = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent-locale.model'));
const ConsentCountry = require(path.join(process.cwd(), 'src/modules/privacy/consent-country/server/consent-country.model'));
const Application = require(path.join(process.cwd(), 'src/modules/platform/application/server/application.model'));
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const PasswordPolicies = require(path.join(process.cwd(), 'src/modules/core/server/password/password-policies'));
const { getUserPermissions } = require(path.join(process.cwd(), 'src/modules/platform/user/server/permission/permissions'));
const Filter = require(path.join(process.cwd(), "src/modules/core/server/filter/filter.model"));
const filterService = require(path.join(process.cwd(), 'src/modules/platform/user/server/filter'));
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));
const Country = require(path.join(process.cwd(), 'src/modules/core/server/country/country.model'));

function generateAccessToken(doc) {
    return jwt.sign({
        id: doc.id
    }, nodecache.getValue('HCP_TOKEN_SECRET'), {
        expiresIn: '2d',
        issuer: doc.id.toString()
    });
}

function generateConsentConfirmationAccessToken(doc) {
    return jwt.sign({
        id: doc.id
    }, nodecache.getValue('CONSENT_CONFIRMATION_TOKEN_SECRET'), {
        expiresIn: '7d',
        issuer: doc.id.toString()
    });
}

function getHcpViewModel(hcp) {
    const model = _.pickBy(hcp);

    delete model.password;
    delete model.created_at;
    delete model.updated_at;
    delete model.created_by;
    delete model.updated_by;
    delete model.reset_password_token;
    delete model.reset_password_expires;

    return model;
}

async function notifyHcpUserApproval(hcpUser) {
    const userApplication = await Application.findOne({ where: { id: hcpUser.application_id } });
    const token = jwt.sign({
        id: hcpUser.id
    }, userApplication.auth_secret, {
        expiresIn: '1h'
    });

    const payload = hcpUser.status === 'consent_pending'
        ? { consent_confirmation_token: generateConsentConfirmationAccessToken(hcpUser) }
        : { password_setup_token: hcpUser.reset_password_token };

    payload.jwt_token = token;

    await axios.post(`${hcpUser.origin_url}${userApplication.metadata.approve_user_path}`, payload, {
        headers: {
            jwt_token: token
        }
    });
}

async function addPasswordResetTokenToUser(user) {
    user.reset_password_token = crypto.randomBytes(36).toString('hex');
    user.reset_password_expires = Date.now() + 3600000;

    await user.save();
}

var trimRequestBody = function (reqBody) {
    Object.keys(reqBody).forEach(key => {
        if (typeof reqBody[key] === 'string')
            reqBody[key] = reqBody[key].trim();
    });
    return reqBody;
}

function ignoreCaseArray(str) {
    return [str.toLowerCase(), str.toUpperCase(), str.charAt(0).toLowerCase() + str.charAt(1).toUpperCase(), str.charAt(0).toUpperCase() + str.charAt(1).toLowerCase()];
}

async function generateFilterOptions(currentFilterSettings, userPermittedApplications, userPermittedCountries, status, table) {
    const getAllCountries = async () => {
        const countries = await Country.findAll();
        return countries.map(c => c.dataValues);
    };

    let allCountries = [];
    let defaultFilter = {};
    let user_country_iso2_list = [];

    if (table === 'hcp_profiles') {
        allCountries = await getAllCountries();

        const user_codbase_list_for_iso2 = allCountries.filter(c => userPermittedCountries.includes(c.country_iso2))
            .map(i => i.codbase);

        user_country_iso2_list = allCountries.filter(c => user_codbase_list_for_iso2.includes(c.codbase))
            .map(i => i.country_iso2);

        const ignorecase_of_country_iso2_list = [].concat.apply([], user_country_iso2_list.map(i => ignoreCaseArray(i)));

        defaultFilter = {
            application_id: userPermittedApplications.length
                ? userPermittedApplications.map(app => app.id)
                : null,
            country_iso2: ignorecase_of_country_iso2_list.length
                ? ignorecase_of_country_iso2_list
                : null
        };

        if (status) {
            defaultFilter.status = status;
        }
    }

    if (table === 'datasync_hcp_profiles') {
        const getUserPermittedCodbases = async () => {
            const allCountryList = await getAllCountries();

            const userCodBases = allCountryList.filter(c => userPermittedCountries.includes(c.country_iso2)).map(c => c.codbase.toLowerCase());
            return userCodBases;
        };

        const countryFilter = (currentFilterSettings.filters || []).find(f => f.fieldName === 'codbase');
        if (!countryFilter) {
            const codbases = await getUserPermittedCodbases();
            defaultFilter = {
                [Op.or]: codbases.map(codbase => { return where(col('codbase'), 'iLIKE', codbase); })
            };
        }
    }

    if (!currentFilterSettings || !currentFilterSettings.filters || currentFilterSettings.filter === 0)
        return defaultFilter;

    let customFilter = { ...defaultFilter };

    const nodes = currentFilterSettings.logic && currentFilterSettings.filters.length > 1
        ? currentFilterSettings.logic.split(" ")
        : ['1'];

    let prevOperator;
    const groupedQueries = [];
    const findFilter = (name) => {
        return currentFilterSettings.filters.find(f => f.name === name);
    };

    const generateQueryObject = (filterObj) => {
        /** Country filter is specially handled as
         *  there can be multiple country under a Codbase and
         *  hcp_profiles table saves country_iso2, not codbase
         */
        if (filterObj.fieldName === 'country') {
            const country_iso2_list_for_codbase = allCountries.filter(ac => filterObj.value.some(v => ac.codbase.toLowerCase() === v.toLowerCase())).map(i => i.country_iso2);

            const selected_iso2_list_for_codbase = country_iso2_list_for_codbase.filter(i => user_country_iso2_list.includes(i));
            const ignorecase_of_selected_iso2_list_for_codbase = [].concat.apply([], selected_iso2_list_for_codbase.map(i => ignoreCaseArray(i)));

            delete customFilter.country_iso2;
            return {
                ['country_iso2']: ignorecase_of_selected_iso2_list_for_codbase.length
                    ? ignorecase_of_selected_iso2_list_for_codbase
                    : null
            };
        }

        if (filterObj.fieldName === 'specialty') {
            return {
                [Op.or]: [
                    { specialty_1_code: filterObj.value },
                    { specialty_2_code: filterObj.value },
                    { specialty_3_code: filterObj.value }
                ]
            };
        }

        return filterService.getFilterQuery(filterObj);
    };

    for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index];
        const prev = index > 0 ? nodes[index - 1] : null;
        const next = index < nodes.length - 1 ? nodes[index + 1] : null;

        if (node === "and" && prevOperator === "and") {
            const filter = findFilter(next);
            const query = generateQueryObject(filter);
            const currentParent = groupedQueries[groupedQueries.length - 1];
            currentParent.values.push(query);
        } else if (node === "and") {
            const leftFilter = findFilter(prev);
            const rightFilter = findFilter(next);
            const group = {
                operator: "and",
                values: [
                    generateQueryObject(leftFilter),
                    generateQueryObject(rightFilter)
                ]
            };
            groupedQueries.push(group);
        } else if (node !== "or" && prev !== "and" && next !== "and") {
            const filter = findFilter(node);
            const query = generateQueryObject(filter);
            groupedQueries.push(query);
        }

        prevOperator = node === "and" || node === "or" ? node : prevOperator;
    }

    const operatorSymbols = Object.getOwnPropertySymbols(customFilter);

    if (groupedQueries.length > 1) {
        const queryValue = groupedQueries.map(q => {
            if (q.operator === 'and') {
                return { [Op.and]: q.values };
            }
            return q;
        });
        if (operatorSymbols[0] && operatorSymbols[0].toString() === 'Symbol(or)') {
            customFilter = {
                [Op.and]: [
                    customFilter,
                    { [Op.or]: queryValue }
                ]
            };
        } else {
            customFilter[Op.or] = queryValue;
        }
    } else {
        const query = groupedQueries[0];
        if (query.operator === 'and') {
            customFilter[Op.and] = query.values;
        } else {
            customFilter = operatorSymbols[0] && operatorSymbols[0].toString() === 'Symbol(or)'
                ? {
                    [Op.and]: [
                        customFilter,
                        query
                    ]
                }
                : { ...customFilter, ...query };
        }
    }

    return customFilter;
}

async function getHcps(req, res) {
    const response = new Response({}, []);

    try {
        const page = req.query.page ? +req.query.page - 1 : 0;
        const limit = req.query.limit ? +req.query.limit : 15;
        let status = req.query.status === undefined ? null : req.query.status;
        if (status && status.indexOf(',') !== -1) status = status.split(',');
        const offset = page * limit;

        const currentFilter = req.body;
        const { fields } = req.body;

        const [userPermittedApplications, userPermittedCountries] = await getUserPermissions(req.user.id);

        const orderBy = req.query.orderBy === 'null'
            ? null
            : req.query.orderBy;
        const orderType = req.query.orderType === 'asc' || req.query.orderType === 'desc'
            ? req.query.orderType
            : 'asc';

        const order = [];

        const columnNames = Object.keys(Hcp.rawAttributes);
        if (orderBy && (columnNames || []).includes(orderBy)) {
            order.push([orderBy, orderType]);
        }

        order.push(['created_at', 'DESC']);
        order.push(['id', 'DESC']);

        const getAttributes = () => {
            const fieldsToExclude = ['hcpConsents', 'origin_url', 'password', 'password_updated_at', 'reset_password_expires', 'reset_password_token', 'failed_auth_attempt', 'created_by', 'updated_by', 'updated_at'];

            let requiredAttributes = fields && fields.length
                ? fields.filter(field => !fieldsToExclude.includes(field))
                : null;

            return requiredAttributes ? requiredAttributes : { exclude: fieldsToExclude };
        }

        const filterOptions = await generateFilterOptions(currentFilter, userPermittedApplications, userPermittedCountries, status, 'hcp_profiles');

        const hcps = await Hcp.findAll({
            where: filterOptions,
            include: !fields || fields.includes('hcpConsent')
                ? [{
                    model: HcpConsents,
                    as: 'hcpConsents',
                    attributes: ['consent_id', 'consent_confirmed', 'opt_type'],
                }]
                : null,
            attributes: getAttributes(),
            offset,
            limit,
            order
        });

        if (!fields || !fields.length) {
            hcps.map(hcp => {
                const opt_types = new Set();

                hcp['hcpConsents'].map(hcpConsent => {
                    if (hcpConsent.consent_confirmed || hcpConsent.opt_type === 'opt-out') {
                        opt_types.add(hcpConsent.opt_type);
                    }
                });

                hcp.dataValues.opt_types = [...opt_types];
                delete hcp.dataValues['hcpConsents'];
            });
        }

        const totalUser = await Hcp.count({ where: filterOptions });

        if (hcps.length && (!fields || !fields.length || fields.includes('specialty_onekey'))) {
            const specialties = _.uniq(_.map(hcps, 'specialty_onekey')).join("','");

            const specialty_list = await sequelize.datasyncConnector.query(`
                SELECT cod_id_onekey, cod_description
                FROM ciam.vwspecialtymaster
                WHERE cod_id_onekey IN ('${specialties}') AND cod_locale='en'
            `, {
                type: QueryTypes.SELECT
            });

            hcps.forEach(h => {
                h.setDataValue('specialty_description', specialty_list.find(x => x.cod_id_onekey === h.specialty_onekey).cod_description);
            });
        }

        const data = {
            users: hcps,
            page: page + 1,
            limit,
            total: totalUser,
            start: limit * page + 1,
            end: offset + limit > totalUser ? totalUser : offset + limit,
            status: status ? status : null,
            countries: userPermittedCountries
        };

        response.data = data;
        res.json(response);
    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function updateHcps(req, res) {
    const Hcps = req.body;
    const response = new Response([], []);
    const hcpsToUpdate = [];
    const hcpModelInstances = [];
    const emailsToUpdate = new Map();
    const uuidsToUpdate = new Map();
    const allUpdateRecordsForLogging = [];

    function Data(rowIndex, property, value) {
        this.rowIndex = rowIndex;
        this.property = property;
        this.value = value;
    }

    function Error(rowIndex, property, message) {
        this.rowIndex = rowIndex;
        this.property = property;
        this.message = message;
    }

    try {
        if (!Array.isArray(Hcps)) {
            response.error.push(new CustomError('Must be an array', 400));
            return res.status(400).send(response);
        }

        await Promise.all(Hcps.map(async hcp => {
            const { id, email, first_name, last_name, uuid, specialty_onekey, country_iso2, telephone, individual_id_onekey, _rowIndex } = trimRequestBody(hcp);
            let individual_id_onekey_from_UUID;
            let UUID_from_individual_id_onekey;

            if (!id) {
                response.errors.push(new Error(_rowIndex, 'id', 'ID is missing.'));
            }

            const HcpUser = await Hcp.findOne({ where: { id: id } });

            if (!HcpUser) {
                response.errors.push(new Error(_rowIndex, 'id', 'User not found.'));
            }

            if (email) {
                if (!validator.isEmail(email)) {
                    response.errors.push(new Error(_rowIndex, 'email', 'Invalid email'));
                } else {
                    const doesEmailExist = await Hcp.findOne({
                        where: {
                            id: { [Op.ne]: id },
                            email: { [Op.iLike]: `${email}` }
                        }
                    }
                    );

                    if (doesEmailExist) {
                        response.errors.push(new Error(_rowIndex, 'email', 'Email already exists'));
                    }

                    if (emailsToUpdate.has(email)) {
                        emailsToUpdate.get(email).push(_rowIndex);
                    } else {
                        emailsToUpdate.set(email, [_rowIndex]);
                    }
                }
            }

            let uuid_from_master_data;

            if (uuid) {
                let master_data = {};

                const uuidWithoutSpecialCharacter = uuid.replace(/[-]/gi, '');

                master_data = await sequelize.datasyncConnector.query(`select * from ciam.vwhcpmaster
                        where regexp_replace(uuid_1, '[-]', '', 'gi') = $uuid
                        OR regexp_replace(uuid_2, '[-]', '', 'gi') = $uuid`, {
                    bind: { uuid: uuidWithoutSpecialCharacter },
                    type: QueryTypes.SELECT
                });
                master_data = master_data && master_data.length ? master_data[0] : {};

                const uuid_1_from_master_data = (master_data.uuid_1 || '');
                const uuid_2_from_master_data = (master_data.uuid_2 || '');

                uuid_from_master_data = [uuid_1_from_master_data, uuid_2_from_master_data]
                    .find(hcp_id => hcp_id.replace(/[-]/gi, '') === uuidWithoutSpecialCharacter);

                const doesUUIDExist = await Hcp.findOne({
                    where: {
                        id: {
                            [Op.ne]: id
                        },
                        uuid: uuid_from_master_data || uuid
                    }
                });

                if (doesUUIDExist) {
                    response.errors.push(new Error(_rowIndex, 'uuid', 'UUID already exists.'));
                }

                if (Object.keys(master_data).length) {
                    individual_id_onekey_from_UUID = master_data.individual_id_onekey || null;
                } else {
                    individual_id_onekey_from_UUID = null;
                }

                if (uuidsToUpdate.has(uuid_from_master_data || uuid)) {
                    uuidsToUpdate.get(uuid_from_master_data || uuid).push(_rowIndex);
                } else {
                    uuidsToUpdate.set(uuid_from_master_data || uuid, [_rowIndex]);
                }
            }

            if (individual_id_onekey) {
                const doesOnekeyExists = await Hcp.findOne({
                    where: {
                        id: { [Op.ne]: id },
                        individual_id_onekey
                    }
                });

                if (doesOnekeyExists) {
                    response.errors.push(new Error(_rowIndex, 'individual_id_onekey', 'Individual Onekey ID already exists.'));
                } else {
                    const master_data = await sequelize.datasyncConnector.query(
                        `SELECT * from ciam.vwhcpmaster
                        WHERE individual_id_onekey = $individual_id_onekey`, {
                        bind: { individual_id_onekey },
                        type: QueryTypes.SELECT
                    });

                    if (master_data && master_data.length) {
                        UUID_from_individual_id_onekey = master_data[0].uuid_1 || master_data[0].uuid_2 || '';

                        if (UUID_from_individual_id_onekey && !uuid) {
                            const doesUUIDExist = await Hcp.findOne({
                                where: {
                                    id: {
                                        [Op.ne]: id
                                    },
                                    uuid: UUID_from_individual_id_onekey
                                }
                            });

                            if (doesUUIDExist) {
                                response.errors.push(new Error(_rowIndex, 'uuid', 'UUID already exists.'));
                            }

                            if (uuidsToUpdate.has(UUID_from_individual_id_onekey)) {
                                uuidsToUpdate.get(UUID_from_individual_id_onekey).push(_rowIndex);
                            } else {
                                uuidsToUpdate.set(UUID_from_individual_id_onekey, [_rowIndex]);
                            }
                        }
                    } else {
                        response.errors.push(new Error(_rowIndex, 'individual_id_onekey', 'Individual Onekey ID is not valid or not in the contract.'));
                    }
                }
            }

            hcpsToUpdate.push({
                uuid: individual_id_onekey && uuid
                    ? uuid_from_master_data || uuid
                    : UUID_from_individual_id_onekey || uuid_from_master_data || uuid,
                email,
                first_name,
                last_name,
                specialty_onekey,
                country_iso2,
                telephone,
                individual_id_onekey: individual_id_onekey && uuid
                    ? individual_id_onekey
                    : individual_id_onekey_from_UUID
            });

            HcpUser.dataValues._rowIndex = _rowIndex;
            hcpModelInstances.push(HcpUser);
        }));

        emailsToUpdate.forEach((listOfIndex) => {
            if (listOfIndex.length > 1) {
                listOfIndex.map(ind => response.errors.push(new Error(ind, 'email', 'Email matches with another row.')))
            }
        })

        uuidsToUpdate.forEach((listOfIndex) => {
            if (listOfIndex.length > 1) {
                listOfIndex.map(ind => response.errors.push(new Error(ind, 'uuid', 'UUID matches with another row.')))
            }
        })

        if (response.errors && response.errors.length) {
            return res.status(400).send(response);
        }

        await Promise.all(hcpModelInstances.map(async (hcp, index) => {
            const updatedPropertiesLog = [];

            Object.keys(hcpsToUpdate[index]).forEach(key => {
                if (hcpsToUpdate[index][key] || hcpsToUpdate[index][key] === null) {
                    const updatedPropertyLogObject = {
                        field: key,
                        old_value: hcp.dataValues[key],
                        new_value: hcpsToUpdate[index][key]
                    };
                    updatedPropertiesLog.push(updatedPropertyLogObject);
                }
            });

            await hcp.update(hcpsToUpdate[index]);
            allUpdateRecordsForLogging.push(updatedPropertiesLog);
        }));

        await Promise.all(hcpModelInstances.map(async (hcp, index) => {
            logService.log({
                event_type: 'UPDATE',
                object_id: hcp.id,
                table_name: 'hcp_profiles',
                actor: req.user.id,
                remarks: Hcps[index].comment.trim(),
                changes: allUpdateRecordsForLogging[index]
            });
        }));

        hcpModelInstances.map((hcpModelIns, idx) => {
            const { _rowIndex } = hcpModelIns.dataValues;
            Object.keys(hcpsToUpdate[idx]).forEach(key => {
                if (hcpsToUpdate[idx][key] || hcpsToUpdate[idx][key] === null) response.data.push(new Data(_rowIndex, key, hcpModelIns.dataValues[key]));
            })
        });

        res.json(response);
    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function registrationLookup(req, res) {
    const { email, uuid } = req.body;

    const response = new Response({}, []);

    try {
        const profileByEmail = await Hcp.findOne({ where: where(fn('lower', col('email')), fn('lower', email)) });

        if (profileByEmail) {
            response.errors.push(new CustomError('Email address is already registered.', 4001, 'email'));
            return res.status(400).send(response);
        }

        const uuidWithoutSpecialCharacter = uuid.replace(/[-/]/gi, '');

        const master_data = await sequelize.datasyncConnector.query(`
            SELECT individual_id_onekey, uuid_1, uuid_2, ind_prefixname_desc, firstname, lastname, country_iso2, telephone, specialty_1_code
            FROM ciam.vwhcpmaster
            WHERE regexp_replace(uuid_1, '[-]', '', 'gi') = $uuid
            OR regexp_replace(uuid_2, '[-]', '', 'gi') = $uuid
        `, {
            bind: { uuid: uuidWithoutSpecialCharacter },
            type: QueryTypes.SELECT
        });

        let uuid_from_master_data;

        if (master_data && master_data.length) {
            const uuid_1_from_master_data = (master_data[0].uuid_1 || '');
            const uuid_2_from_master_data = (master_data[0].uuid_2 || '');

            uuid_from_master_data = [uuid_1_from_master_data, uuid_2_from_master_data].find(id => id.replace(/[-/]/gi, '') === uuidWithoutSpecialCharacter);
        }

        const profileByUUID = await Hcp.findOne({ where: { uuid: uuid_from_master_data || uuid } });

        if (profileByUUID) {
            response.errors.push(new CustomError('UUID is already registered.', 4101, 'uuid'));
            return res.status(400).send(response);
        }

        if (master_data && master_data.length) {
            response.data = {
                salutation: master_data[0].ind_prefixname_desc,
                individual_id_onekey: master_data[0].individual_id_onekey,
                uuid: master_data[0].uuid_1 || master_data[0].uuid_2,
                first_name: master_data[0].firstname,
                last_name: master_data[0].lastname,
                country_iso2: master_data[0].country_iso2,
                telephone: master_data[0].telephone,
                specialty_onekey: master_data[0].specialty_1_code
            };
        } else {
            response.errors.push(new CustomError('Invalid UUID.', 4100, 'uuid'));
            return res.status(400).send(response);
        }

        res.json(response);
    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function createHcpProfile(req, res) {
    const response = new Response({}, []);
    const { email, uuid, salutation, first_name, last_name, country_iso2, language_code, specialty_onekey, telephone, birthdate, origin_url } = req.body;

    const specialty_master_data = await sequelize.datasyncConnector.query("SELECT * FROM ciam.vwspecialtymaster WHERE cod_id_onekey = $specialty_onekey", {
        bind: { specialty_onekey },
        type: QueryTypes.SELECT
    });

    if (!specialty_master_data.length) {
        response.errors.push(new CustomError('specialty_onekey is invalid.', 400, 'specialty_onekey'));
    }

    if (response.errors.length) {
        return res.status(400).send(response);
    }

    try {
        const isEmailExists = await Hcp.findOne({ where: where(fn('lower', col('email')), fn('lower', email)) });

        if (isEmailExists) {
            response.errors.push(new CustomError('Email already exists.', 4001, 'email'));
        }

        let master_data = {};
        let uuid_from_master_data;

        if (uuid) {
            const uuidWithoutSpecialCharacter = uuid.replace(/[-/]/gi, '');

            master_data = await sequelize.datasyncConnector.query(`select * from ciam.vwhcpmaster
                    where regexp_replace(uuid_1, '[-]', '', 'gi') = $uuid
                    OR regexp_replace(uuid_2, '[-]', '', 'gi') = $uuid`, {
                bind: { uuid: uuidWithoutSpecialCharacter },
                type: QueryTypes.SELECT
            });
            master_data = master_data && master_data.length ? master_data[0] : {};

            const uuid_1_from_master_data = (master_data.uuid_1 || '');
            const uuid_2_from_master_data = (master_data.uuid_2 || '');

            uuid_from_master_data = [uuid_1_from_master_data, uuid_2_from_master_data]
                .find(id => id.replace(/[-/]/gi, '') === uuidWithoutSpecialCharacter);
        }

        const isUUIDExists = await Hcp.findOne({ where: { uuid: uuid_from_master_data || uuid } });

        if (isUUIDExists) {
            response.errors.push(new CustomError('UUID already exists.', 4101, 'uuid'));
        }

        if (response.errors.length) {
            return res.status(400).send(response);
        }

        const countries = await Country.findAll({
            order: [
                ['codbase_desc', 'ASC'],
                ['countryname', 'ASC']
            ]
        });

        let hasDoubleOptIn = false;
        let consentArr = [];

        if (req.body.consents && req.body.consents.length) {
            await Promise.all(req.body.consents.map(async consent => {
                const preferenceId = Object.keys(consent)[0];
                const consentResponse = Object.values(consent)[0];
                let richTextLocale = `${language_code}_${country_iso2.toUpperCase()}`;

                if (!consentResponse) return;

                const consentDetails = await Consent.findOne({ where: { id: preferenceId } });

                if (!consentDetails) {
                    response.errors.push(new CustomError('Invalid consents.', 400));
                    return;
                }

                const currentCountry = countries.find(c => c.country_iso2.toLowerCase() === country_iso2.toLowerCase());

                const baseCountry = countries.find(c => c.countryname === currentCountry.codbase_desc);

                const consentCountry = await ConsentCountry.findOne({
                    where: {
                        country_iso2: {
                            [Op.iLike]: baseCountry.country_iso2
                        },
                        consent_id: consentDetails.id
                    }
                });

                if (!consentCountry) {
                    response.errors.push(new CustomError('Invalid consent country.', 400));
                    return;
                }

                let consentLocale = await ConsentLocale.findOne({
                    where: {
                        consent_id: preferenceId,
                        locale: { [Op.iLike]: `${language_code}_${country_iso2}` }
                    }
                });

                if (!consentLocale) {
                    const userCountry = countries.filter(c => c.country_iso2.toLowerCase() === country_iso2.toLocaleLowerCase());
                    const codbaseCountry = countries.filter(c => c.countryname === c.codbase_desc && c.codbase === userCountry[0].codbase);

                    const localeUsingParentCountryISO = `${language_code}_${(codbaseCountry[0].country_iso2 || '').toUpperCase()}`;

                    consentLocale = await ConsentLocale.findOne({
                        where: {
                            consent_id: preferenceId,
                            locale: { [Op.iLike]: localeUsingParentCountryISO }
                        }
                    });

                    richTextLocale = localeUsingParentCountryISO;
                }

                if (!consentLocale) {
                    response.errors.push(new CustomError('Invalid consent locale.', 400));
                    return;
                }

                if (consentCountry.opt_type === 'double-opt-in') {
                    hasDoubleOptIn = true;
                }

                consentArr.push({
                    consent_id: consentDetails.id,
                    consent_confirmed: consentCountry.opt_type === 'double-opt-in' ? false : true,
                    opt_type: consentCountry.opt_type,
                    rich_text: validator.unescape(consentLocale.rich_text),
                    consent_locale: richTextLocale,
                    created_by: req.user.id,
                    updated_by: req.user.id
                });
            }));
        }

        if (response.errors.length) {
            return res.status(400).send(response);
        }

        const model = {
            email: email.toLowerCase(),
            uuid: uuid_from_master_data || uuid,
            salutation,
            first_name,
            last_name,
            language_code: language_code.toLowerCase(),
            country_iso2: country_iso2.toLowerCase(),
            locale: `${language_code.toLowerCase()}_${country_iso2.toUpperCase()}`,
            specialty_onekey,
            telephone,
            birthdate,
            application_id: req.user.id,
            individual_id_onekey: master_data.individual_id_onekey,
            status: master_data.individual_id_onekey ? hasDoubleOptIn ? 'consent_pending' : 'self_verified' : 'not_verified',
            origin_url,
            created_by: req.user.id,
            updated_by: req.user.id
        };

        const hcpUser = await Hcp.create(model);

        if (consentArr.length) {
            consentArr = consentArr.map(c => {
                c.user_id = hcpUser.id
                return c;
            });
            await HcpConsents.bulkCreate(consentArr, {
                returning: true,
                ignoreDuplicates: false
            });
        }

        response.data = getHcpViewModel(hcpUser.dataValues);

        if (hcpUser.dataValues.status === 'consent_pending') {
            response.data.consent_confirmation_token = generateConsentConfirmationAccessToken(hcpUser);
        }

        if (hcpUser.dataValues.status === 'self_verified') {
            await addPasswordResetTokenToUser(hcpUser);

            response.data.password_reset_token = hcpUser.dataValues.reset_password_token;
            response.data.retention_period = '1 hour';
        }

        await logService.log({
            event_type: 'CREATE',
            object_id: hcpUser.id,
            table_name: 'hcp_profiles',
            actor: req.user.id
        });

        res.json(response);
    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function confirmConsents(req, res) {
    const response = new Response({}, []);

    try {
        const payload = jwt.verify(req.body.token, nodecache.getValue('CONSENT_CONFIRMATION_TOKEN_SECRET'));
        const hcpUser = await Hcp.findOne({ where: { id: payload.id } });

        if (!hcpUser) {
            response.errors.push(new CustomError('Invalid token.', 4400));
            return res.status(400).send(response);
        }

        if (hcpUser.status !== 'consent_pending') {
            response.errors.push(new CustomError('Invalid token.', 4400));
            return res.status(400).send(response);
        }

        let userConsents = await HcpConsents.findAll({ where: { user_id: payload.id } });

        if (userConsents && userConsents.length) {
            userConsents = userConsents.map(consent => ({
                ...consent.dataValues,
                rich_text: consent.rich_text,
                consent_confirmed: true
            }));

            await HcpConsents.bulkCreate(userConsents, {
                updateOnDuplicate: ['consent_confirmed']
            });
        }

        await hcpUser.update({ is_email_verified: true });

        hcpUser.status = hcpUser.individual_id_onekey ? 'self_verified' : 'manually_verified';
        await addPasswordResetTokenToUser(hcpUser);

        response.data = {
            ...getHcpViewModel(hcpUser.dataValues),
            password_reset_token: hcpUser.dataValues.reset_password_token,
            retention_period: '1 hour'
        };

        res.json(response);
    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function approveHCPUser(req, res) {
    const response = new Response({}, []);
    const id = req.params.id;

    try {
        const hcpUser = await Hcp.findOne({ where: { id } });

        if (!hcpUser) {
            response.errors.push(new CustomError('User does not exist.', 404));
        }

        if (hcpUser.dataValues.status !== 'not_verified') {
            response.errors.push(new CustomError('Invalid user status for this request.', 400));
        }

        if (response.errors.length) {
            return res.status(400).send(response);
        }

        let userConsents = await HcpConsents.findAll({ where: { [Op.and]: [{ user_id: id }, { consent_confirmed: false }] } });

        let hasDoubleOptIn = false;

        if (userConsents && userConsents.length) {
            hasDoubleOptIn = true;
        }

        hcpUser.status = hasDoubleOptIn ? 'consent_pending' : 'manually_verified';
        await hcpUser.save();

        if (hcpUser.dataValues.status === 'manually_verified') {
            await addPasswordResetTokenToUser(hcpUser);
        }

        try {
            await notifyHcpUserApproval(hcpUser);
        } catch (e) {
            await hcpUser.update({
                status: 'not_verified',
                reset_password_token: null,
                reset_password_expires: null
            });
            logger.error(e);
            response.errors.push(new CustomError('Failed to approve user.', 400));
            return res.status(400).send(response);
        }

        response.data = getHcpViewModel(hcpUser.dataValues);

        await logService.log({
            event_type: 'UPDATE',
            object_id: hcpUser.id,
            table_name: 'hcp_profiles',
            actor: req.user.id,
            remarks: (req.body.comment || '').trim()
        });

        res.json(response);
    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function rejectHCPUser(req, res) {
    const response = new Response({}, []);
    const id = req.params.id;

    try {
        const hcpUser = await Hcp.findOne({ where: { id } });

        if (!hcpUser) {
            response.errors.push(new CustomError('User does not exist.', 404));
            return res.status(404).send(response);
        }

        if (hcpUser.dataValues.status !== 'not_verified') {
            response.errors.push(new CustomError('Invalid user status for this request.', 400));
            return res.status(400).send(response);
        }

        response.data = getHcpViewModel(hcpUser.dataValues);

        await hcpUser.update({ status: 'rejected' });

        await archiveService.archiveData({
            object_id: hcpUser.id,
            table_name: 'hcp_profiles',
            data: hcpUser.dataValues,
            actor: req.user.id,
            remarks: (req.body.comment || '').trim()
        });

        await logService.log({
            event_type: 'CREATE',
            object_id: hcpUser.id,
            table_name: 'archive',
            actor: req.user.id,
            remarks: (req.body.comment || '').trim()
        });

        await hcpUser.destroy();

        res.json(response);
    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getHcpProfile(req, res) {
    const response = new Response({}, []);
    try {
        const doc = await Hcp.findOne({
            where: { id: req.params.id },
            attributes: { exclude: ['password', 'created_at', 'updated_at', 'created_by', 'updated_by', 'reset_password_token', 'reset_password_expires', 'failed_auth_attempt', 'password_updated_at', 'application_id'] }
        });

        if (!doc) {
            response.errors.push(new CustomError('Profile not found.', 404));
            return res.status(404).send(response);
        }

        response.data = getHcpViewModel(doc.dataValues);

        const userConsents = await HcpConsents.findAll({
            where: { user_id: doc.id },
            include: {
                model: Consent,
                as: 'consent'
            },
            attributes: ['consent_id', 'consent_confirmed', 'opt_type', 'updated_at']
        });

        if (!userConsents) return res.json([]);

        const userConsentDetails = await ConsentLocale.findAll({
            where: {
                consent_id: userConsents.map(consent => consent.consent_id),
                locale: {
                    [Op.iLike]: `%${doc.locale}`
                }
            }, attributes: ['consent_id', 'rich_text']
        });

        response.data = {
            ...response.data,
            consents: userConsents.map(userConsent => {
                const localization = userConsentDetails && userConsentDetails.length
                    ? userConsentDetails.find(ucd => ucd.consent_id === userConsent.consent_id)
                    : { rich_text: 'Localized text not found for this consent.' };

                const consentData = {
                    consent_given: userConsent.consent_confirmed,
                    consent_given_time: userConsent.updated_at,
                    id: userConsent.consent_id,
                    opt_type: userConsent.opt_type,
                    preference: userConsent.consent.preference,
                    rich_text: validator.unescape(localization.rich_text)
                }
                return consentData;
            })
        };

        res.json(response);
    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getHCPUserConsents(req, res) {
    const response = new Response({}, []);

    try {
        const doc = await Hcp.findOne({
            where: { id: req.params.id }
        });

        if (!doc) {
            response.errors.push(new CustomError('Profile not found.', 404));
            return res.status(404).send(response);
        }

        const userConsents = await HcpConsents.findAll({
            where: { user_id: doc.id },
            include: {
                model: Consent,
                as: 'consent'
            },
            attributes: ['consent_id', 'consent_confirmed', 'rich_text', 'opt_type', 'updated_at']
        });

        if (!userConsents.length) return res.json([]);

        response.data = userConsents.map(userConsent => {
            return {
                consent_given: userConsent.consent_confirmed,
                consent_given_time: userConsent.updated_at,
                id: userConsent.consent_id,
                opt_type: userConsent.opt_type,
                preference: userConsent.consent.preference,
                rich_text: userConsent.rich_text
            };
        });

        res.json(response);
    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function changePassword(req, res) {
    const { email, current_password, new_password, confirm_password } = req.body;

    const response = new Response({}, []);

    async function log(object_id, actor, message) {
        await logService.log({
            event_type: 'UPDATE',
            object_id,
            table_name: 'hcp_profiles',
            actor,
            remarks: message
        });
    }

    try {
        const doc = await Hcp.findOne({ where: where(fn('lower', col('email')), fn('lower', email)) });

        if (!doc || !doc.validPassword(current_password)) {
            response.errors.push(new CustomError('Invalid credentials.', 401));
            return res.status(401).send(response);
        }

        if (await PasswordPolicies.minimumPasswordAge(doc.password_updated_at)) {
            response.errors.push(new CustomError(`You cannot change password before 1 day`, 4202));
            return res.status(400).send(response);
        }

        if (await PasswordPolicies.isOldPassword(new_password, doc)) {
            response.errors.push(new CustomError(`New password can not be your previously used password.`, 4203));
            return res.status(400).send(response);
        }

        if (!PasswordPolicies.validatePassword(new_password)) {
            response.errors.push(new CustomError(`Password must contain atleast a digit, an uppercase, a lowercase and a special character and must be 8 to 50 characters long.`, 4200));
            return res.status(400).send(response);
        }

        if (!PasswordPolicies.hasValidCharacters(new_password)) {
            response.errors.push(new CustomError(`Password has one or more invalid character.`, 4200));
            return res.status(400).send(response);
        }

        if (PasswordPolicies.isCommonPassword(new_password, doc)) {
            response.errors.push(new CustomError(`Password can not be commonly used passwords or personal info. Try a different one.`, 400));
            return res.status(400).send(response);
        }

        if (new_password !== confirm_password) {
            response.errors.push(new CustomError(`Password and confirm password doesn't match.`, 4201));
            return res.status(400).send(response);
        }

        if (doc.password) await PasswordPolicies.saveOldPassword(doc);

        doc.update({ password: new_password, password_updated_at: new Date(Date.now()) });

        response.data = 'Password changed successfully.';

        await log(doc.id, req.user.id, 'Password change success');

        res.send(response);
    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function resetPassword(req, res) {
    const response = new Response({}, []);

    async function log(object_id, actor, message, event_type = "BAD_REQUEST") {
        await logService.log({
            event_type,
            object_id,
            table_name: 'hcp_profiles',
            actor,
            remarks: message
        });
    }

    try {
        const doc = await Hcp.findOne({ where: { reset_password_token: req.query.token } });

        if (!doc) {
            response.errors.push(new CustomError('Invalid password reset token.', 4400));
            return res.status(404).send(response);
        }

        if (await PasswordPolicies.minimumPasswordAge(doc.password_updated_at)) {
            await log(doc.id, req.user.id, 'HCP Password reset failed');
            response.errors.push(new CustomError(`You cannot change password before 1 day`, 4202));
            return res.status(400).send(response);
        }

        if (doc.reset_password_expires < Date.now()) {
            await log(doc.id, req.user.id, 'HCP Password reset failed');
            response.errors.push(new CustomError('Password reset token has been expired. Please request again.', 4400));
            return res.status(400).send(response);
        }

        if (req.body.new_password !== req.body.confirm_password) {
            await log(doc.id, req.user.id, 'HCP Password reset failed');
            response.errors.push(new CustomError(`Password and confirm password doesn't match.`, 4201));
            return res.status(400).send(response);
        }

        if (await PasswordPolicies.isOldPassword(req.body.new_password, doc)) {
            await log(doc.id, req.user.id, 'HCP Password reset failed');
            response.errors.push(new CustomError(`New password can not be your previously used password.`, 4203));
            return res.status(400).send(response);
        }

        if (!PasswordPolicies.validatePassword(req.body.new_password)) {
            await log(doc.id, req.user.id, 'HCP Password reset failed');
            response.errors.push(new CustomError(`Password must contain atleast a digit, an uppercase, a lowercase and a special character and must be 8 to 50 characters long.`, 4200));
            return res.status(400).send(response);
        }

        if (!PasswordPolicies.hasValidCharacters(req.body.new_password)) {
            await log(doc.id, req.user.id, 'HCP Password reset failed');
            response.errors.push(new CustomError(`Password has one or more invalid character.`, 4200));
            return res.status(400).send(response);
        }

        if (PasswordPolicies.isCommonPassword(req.body.new_password, doc)) {
            await log(doc.id, req.user.id, 'HCP Password reset failed');
            response.errors.push(new CustomError(`Password can not be commonly used passwords or personal info. Try a different one.`, 400));
            return res.status(400).send(response);
        }

        if (req.body.new_password !== req.body.confirm_password) {
            await log(doc.id, req.user.id, 'HCP Password reset failed');
            response.errors.push(new CustomError(`Password and confirm password doesn't match.`, 4201));
            return res.status(400).send(response);
        }

        if (doc.password) await PasswordPolicies.saveOldPassword(doc);

        const is_firsttime_setup = !doc.password;

        const wasAccountLocked = doc.failed_auth_attempt >= 5;

        await doc.update({ password: req.body.new_password, password_updated_at: new Date(Date.now()), reset_password_token: null, reset_password_expires: null });

        await doc.update(
            { failed_auth_attempt: 0 },
            { where: { email: doc.dataValues.email } }
        );

        response.data = {
            message: 'Password reset successfully.',
            is_firsttime_setup
        };

        if (wasAccountLocked) await log(doc.id, req.user.id, 'HCP Password reset success. Account unlocked', 'UPDATE');
        else await log(doc.id, req.user.id, 'HCP Password reset success', 'UPDATE');

        res.json(response);
    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function forgetPassword(req, res) {
    const response = new Response({}, []);
    const { email, uuid } = req.body;

    try {
        const doc = uuid ? await Hcp.findOne({
            where: {
              [Op.and]: [{
                        email: {
                            [Op.iLike]: email
                        }
                    },
                    {
                        uuid: uuid
                    }
                ]
            }
        }): await Hcp.findOne({
            where: {
                email: {
                   [Op.iLike]: email
                }
            }
        });
        if (!doc) {
            response.data = {
                message: 'Successfully sent password reset email.'
            };
            return res.json(response);
        }


        if (doc.dataValues.status === 'self_verified' || doc.dataValues.status === 'manually_verified') {
            await addPasswordResetTokenToUser(doc);

            response.data = {
                message: 'Successfully sent password reset email.',
                password_reset_token: doc.dataValues.reset_password_token,
                user_id: doc.dataValues.id
            };

            return res.json(response);
        }

        response.errors.push(new CustomError(`User is not approved yet.`, 400));
        res.status(400).send(response);

    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getSpecialties(req, res) {
    const response = new Response([], []);
    try {
        const { country_iso2, locale } = req.query;

        if (!country_iso2) response.errors.push(new CustomError(`Missing required query parameter`, 4300, 'country_iso2'));

        if (!locale) response.errors.push(new CustomError(`Missing required query parameter`, 4300, 'locale'));

        if (response.errors && response.errors.length) return res.status(400).send(response);

        const countries = await Country.findAll({
            where: {
                country_iso2: {
                    [Op.iLike]: country_iso2
                }
            }
        });

        if (!countries || !countries.length) {
            response.data = [];
            return res.status(204).send(response);
        }

        let masterDataSpecialties = await sequelize.datasyncConnector.query(`
            SELECT codbase, cod_id_onekey, cod_locale, cod_description
            FROM ciam.vwspecialtymaster as Specialty
            WHERE LOWER(cod_locale) = $locale AND LOWER(codbase) = $codbase
            ORDER BY cod_description ASC;
            `, {
            bind: {
                locale: locale.toLowerCase(),
                codbase: countries[0].codbase.toLowerCase()
            },
            type: QueryTypes.SELECT
        });

        if (!masterDataSpecialties || masterDataSpecialties.length === 0) {
            const languageCode = locale.split('_')[0];

            masterDataSpecialties = await sequelize.datasyncConnector.query(`
            SELECT codbase, cod_id_onekey, cod_locale, cod_description
            FROM ciam.vwspecialtymaster as Specialty
            WHERE LOWER(cod_locale) = $locale AND LOWER(codbase) = $codbase
            ORDER BY cod_description ASC;
            `, {
                bind: {
                    locale: languageCode.toLowerCase(),
                    codbase: countries[0].codbase.toLowerCase()
                },
                type: QueryTypes.SELECT
            });
        }

        if (!masterDataSpecialties || masterDataSpecialties.length === 0) {
            response.data = [];
            return res.status(204).send(response);
        }

        response.data = masterDataSpecialties;
        res.json(response);
    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getSpecialtiesWithEnglishTranslation(req, res) {
    const response = new Response([], []);
    try {
        const { country_iso2, locale } = req.query;

        if (!country_iso2) response.errors.push(new CustomError(`Missing required query parameter`, 4300, 'country_iso2'));

        if (!locale) response.errors.push(new CustomError(`Missing required query parameter`, 4300, 'locale'));

        if (response.errors && response.errors.length) return res.status(400).send(response);

        const countries = await Country.findAll();

        const currentCountry = countries.find(c => c.country_iso2.toLowerCase() === country_iso2.toLowerCase());

        if (!currentCountry) {
            response.data = [];
            return res.status(204).send(response);
        }

        let masterDataSpecialties = await sequelize.datasyncConnector.query(`
            SELECT cod_id_onekey, codbase, cod_description, cod_locale
            FROM ciam.vwspecialtymaster as Specialty
            WHERE cod_id_onekey in
                    (SELECT cod_id_onekey
                    FROM ciam.vwspecialtymaster as Specialty
                    WHERE LOWER(cod_locale) = $locale AND LOWER(codbase) = $codbase)
                AND (LOWER(cod_locale) = 'en' OR LOWER(cod_locale) = $locale)
            `, {
            bind: {
                locale: locale.toLowerCase(),
                codbase: currentCountry.codbase.toLowerCase()
            },
            type: QueryTypes.SELECT
        });

        if (!masterDataSpecialties.length) {
            const codbaseCountry = countries.filter(c => c.countryname === c.codbase_desc && c.codbase === currentCountry.codbase);

            const localeUsingParentCountryISO = `${locale.split('_')[0]}_${codbaseCountry[0].country_iso2}`;

            masterDataSpecialties = await sequelize.datasyncConnector.query(`
                SELECT cod_id_onekey, codbase, cod_description, cod_locale
                FROM ciam.vwspecialtymaster as Specialty
                WHERE cod_id_onekey in
                        (SELECT cod_id_onekey
                        FROM ciam.vwspecialtymaster as Specialty
                        WHERE LOWER(cod_locale) = $locale AND LOWER(codbase) = $codbase)
                    AND (LOWER(cod_locale) = 'en' OR LOWER(cod_locale) = $locale)
                `, {
                bind: {
                    locale: localeUsingParentCountryISO.toLowerCase(),
                    codbase: currentCountry.codbase.toLowerCase()
                },
                type: QueryTypes.SELECT
            });
        }

        if (!masterDataSpecialties || masterDataSpecialties.length === 0) {
            response.data = [];
            return res.status(204).send(response);
        }

        response.data = masterDataSpecialties;
        res.json(response);
    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getAccessToken(req, res) {
    const response = new Response({}, []);

    try {
        const { email, password } = req.body;

        const doc = await Hcp.findOne({
            where: where(fn('lower', col('email')), fn('lower', email))
        });

        const userLockedError = new CustomError('Your account has been locked for consecutive failed login attempts.', 4002);

        if (doc && doc.dataValues.failed_auth_attempt >= 5) {
            response.errors.push(userLockedError);
            return res.status(401).send(response);
        }

        if (!doc || !doc.password || !doc.validPassword(password)) {

            if (doc && doc.password) {
                await doc.update(
                    { failed_auth_attempt: parseInt(doc.dataValues.failed_auth_attempt ? doc.dataValues.failed_auth_attempt : '0') + 1 }
                );
            }

            const error = doc && doc.dataValues.failed_auth_attempt >= 5
                ? userLockedError
                : new CustomError('Invalid email or password.', 401);

            if (doc && doc.failed_auth_attempt >= 5) {
                await logService.log({
                    event_type: 'LOGIN',
                    object_id: doc.id,
                    table_name: 'hcp_profiles',
                    actor: req.user.id,
                    remarks: 'HCP Login failed. Account locked'
                });
            } else if (doc && doc.password && !doc.validPassword(password)) {
                await logService.log({
                    event_type: 'LOGIN',
                    object_id: doc.id,
                    table_name: 'hcp_profiles',
                    actor: req.user.id,
                    remarks: 'HCP login failed. Wrong password'
                });
            }

            response.errors.push(error);
            return res.status(401).json(response);
        }

        response.data = {
            ...getHcpViewModel(doc.dataValues),
            access_token: generateAccessToken(doc.dataValues),
            retention_period: '48 hours'
        }

        await doc.update(
            { failed_auth_attempt: 0 },
            { where: { email: email } });

        await logService.log({
            event_type: 'LOGIN',
            object_id: doc.id,
            table_name: 'hcp_profiles',
            actor: req.user.id,
            remarks: 'HCP Login success'
        });

        res.json(response);
    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function updateHCPUserConsents(req, res) {
    const response = new Response({}, []);

    try {
        const hcpUser = await Hcp.findOne({ where: { id: req.params.id } });

        if (!hcpUser) {
            response.errors.push(new CustomError('Invalid HCP User.', 400));
        }

        if (response.errors.length) {
            return res.status(400).send(response);
        }

        if (req.body.consents && req.body.consents.length) {
            await Promise.all(req.body.consents.map(async x => {
                const consentId = Object.keys(x)[0];
                const consentResponse = Object.values(x)[0];

                const hcpConsent = await HcpConsents.findOne({ where: { user_id: hcpUser.id, consent_id: consentId } });

                if (!hcpConsent || consentResponse) return;

                await hcpConsent.update({ opt_type: 'opt-out', consent_confirmed: false });
            }));
        }

        response.data = {
            id: req.params.id,
            consents: await HcpConsents.findAll({
                where: { user_id: req.params.id },
                attributes: { exclude: ['created_by', 'updated_by'] }
            })
        };

        res.json(response);
    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('An error occurred. Please try again.', 500));
        res.status(500).send(response);
    }
}

async function getSpecialtiesForCdp(req, res) {
    try {
        const { codbases } = req.query;

        const specialties = await sequelize.datasyncConnector.query(`
            SELECT codbase, cod_id_onekey, cod_locale, cod_description
            FROM ciam.vwspecialtymaster as Specialty
            WHERE LOWER(cod_locale) = 'en'
            ${codbases
                ? 'AND LOWER(codbase) = ' + (Array.isArray(codbases)
                    ? 'ANY($codbases)'
                    : '$codbases')
                : ''}
            ORDER BY cod_description ASC;
            `, {
            bind: {
                codbases: codbases && Array.isArray(codbases)
                    ? codbases.map(c => c.toLowerCase())
                    : (codbases || '').toLowerCase()
            },
            type: QueryTypes.SELECT
        });

        const viewModels = (specialties || []).map(({ codbase, cod_id_onekey, cod_description }) => ({
            codbase,
            codIdOnekey: cod_id_onekey,
            codDescription: cod_description
        }));
        res.json(viewModels);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getHcpsFromDatasync(req, res) {
    try {
        const page = req.query.page ? +req.query.page - 1 : 0;
        const limit = req.query.limit ? +req.query.limit : 15;
        const offset = page * limit;

        const orderBy = req.query.orderBy === 'null'
            ? null
            : req.query.orderBy;
        const orderType = req.query.orderType === 'asc' || req.query.orderType === 'desc'
            ? req.query.orderType
            : 'asc';

        const sortableColumns = ['firstname', 'lastname', 'individual_id_onekey', 'uuid_1', 'ind_status_desc', 'country_iso2'];

        const order = [];
        if (orderBy && (sortableColumns || []).includes(orderBy)) {
            order.push([orderBy, orderType]);
        }

        const currentFilter = req.body;

        const [, userPermittedCountries] = await getUserPermissions(req.user.id);

        const filterOptions = await generateFilterOptions(currentFilter, null, userPermittedCountries, null, 'datasync_hcp_profiles');

        const hcps = await DatasyncHcp.findAll({
            where: filterOptions,
            offset,
            limit,
            order
        });

        const totalUsers = await DatasyncHcp.count({ where: filterOptions });

        hcps.forEach(hcp => {
            const specialties = [
                {
                    description: hcp.specialty_1_long_description,
                    code: hcp.specialty_1_code
                },
                {
                    description: hcp.specialty_2_long_description,
                    code: hcp.specialty_2_code
                },
                {
                    description: hcp.specialty_3_long_description,
                    code: hcp.specialty_3_code
                }
            ];
            const filtered = specialties.filter(s => s.code);
            hcp.dataValues.specialties = filtered;

            delete hcp.dataValues.specialty_1_long_description;
            delete hcp.dataValues.specialty_1_code;
            delete hcp.dataValues.specialty_2_long_description;
            delete hcp.dataValues.specialty_2_code;
            delete hcp.dataValues.specialty_3_long_description;
            delete hcp.dataValues.specialty_3_code;
        });

        const data = {
            users: hcps,
            page: page + 1,
            limit,
            total: totalUsers,
            start: limit * page + 1,
            end: offset + limit > totalUsers ? totalUsers : offset + limit,
            countries: userPermittedCountries
        };

        res.json(data);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getHcps = getHcps;
exports.registrationLookup = registrationLookup;
exports.createHcpProfile = createHcpProfile;
exports.getHcpProfile = getHcpProfile;
exports.changePassword = changePassword;
exports.resetPassword = resetPassword;
exports.forgetPassword = forgetPassword;
exports.getSpecialties = getSpecialties;
exports.getAccessToken = getAccessToken;
exports.confirmConsents = confirmConsents;
exports.approveHCPUser = approveHCPUser;
exports.rejectHCPUser = rejectHCPUser;
exports.getHCPUserConsents = getHCPUserConsents;
exports.updateHcps = updateHcps;
exports.getSpecialtiesWithEnglishTranslation = getSpecialtiesWithEnglishTranslation;
exports.updateHCPUserConsents = updateHCPUserConsents;
exports.getSpecialtiesForCdp = getSpecialtiesForCdp;
exports.getHcpsFromDatasync = getHcpsFromDatasync;
