const path = require('path');
const _ = require('lodash');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const validator = require('validator');
const { QueryTypes, Op, where, col, fn } = require('sequelize');
const Hcp = require('./hcp-profile.model');
const HcpArchives = require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-archives.model'));
const HcpConsents = require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-consents.model'));
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));
const Consent = require(path.join(process.cwd(), 'src/modules/consent/server/consent.model'));
const ConsentLocale = require(path.join(process.cwd(), 'src/modules/consent/server/consent-locale.model'));
const ConsentCountry = require(path.join(process.cwd(), 'src/modules/consent/server/consent-country.model'));
const Application = require(path.join(process.cwd(), 'src/modules/platform/application/server/application.model'));
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const PasswordPolicies = require(path.join(process.cwd(), 'src/modules/core/server/password/password-policies.js'));
const { getUserPermissions } = require(path.join(process.cwd(), 'src/modules/platform/user/server/permission/permissions.js'));
const XRegExp = require('xregexp');
const { string }  = require('yup');
const Filter = require(path.join(process.cwd(), "src/modules/core/server/filter/filter.model.js"));
const filterService = require(path.join(process.cwd(), 'src/modules/platform/user/server/filter.js'));

const hcpValidation = () => {
    const schema = {
        first_name: string()
            .matches(XRegExp('^[\\pL.]+(?:\\s[\\pL.]+)*$'), 'This field only contains letters')
            .min(2, 'This field must be at least 2 characters long.')
            .max(50, 'This field must be at most 50 characters long.')
            .required('This field must not be empty.'),
        last_name: string()
            .matches(XRegExp('^[\\pL.]+(?:\\s[\\pL.]+)*$'), 'This field only contains letters')
            .min(2, 'This field must be at least 2 characters long.')
            .max(50, 'This field must be at most 50 characters long.')
            .required('This field must not be empty.'),
        email: string()
            .email('This field should be a valid email address.')
            .matches(/^.{1,64}@/, 'The part before @ of the email can be maximum 64 characters.')
            .matches(/^.*[a-z]+.*@/, 'This field should be a valid email address.')
            .max(100, 'This field must be at most 100 characters long.')
            .required('This field must not be empty.'),
        uuid: string()
            .max(20, 'This field must be at most 20 characters long.')
            .required('This field must not be empty.'),
        telephone: string()
            .matches(/^(?:[+]?[0-9]*|[0-9]{2,3}[\/]?[0-9]*)$/, 'Must be a valid phone number')
            .transform(value => value === '' ? undefined : value)
            .max(25,'This field must be at most 25 characters long')
            .nullable()
    }

    return {
        validate: async (value, schemaName) => {
            try{
                await schema[schemaName].validate(value);
                return {
                    valid: true
                };
            }catch(err){
                return {
                    valid: false,
                    errors: err.errors
                }
            }
        }
    }
}

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

function mapMasterDataToHcpProfile(masterData) {
    const model = {};

    model.salutation = masterData.ind_prefixname_desc;
    model.individual_id_onekey = masterData.individual_id_onekey;
    model.uuid = masterData.uuid_1 || masterData.uuid_2;
    model.first_name = masterData.firstname;
    model.last_name = masterData.lastname;
    model.country_iso2 = masterData.country_iso2;
    model.telephone = masterData.telephone;
    model.specialty_onekey = masterData.specialty_code;

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

    await axios.post(`${hcpUser.origin_url}${userApplication.approve_user_path}`, payload, {
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

var trimRequestBody = function(reqBody){
    Object.keys(reqBody).forEach(key => {
        if(typeof reqBody[key] === 'string')
            reqBody[key] = reqBody[key].trim();
    });
    return reqBody;
}

function ignoreCaseArray(str) {
    return [str.toLowerCase(), str.toUpperCase(), str.charAt(0).toLowerCase() + str.charAt(1).toUpperCase(), str.charAt(0).toUpperCase() + str.charAt(1).toLowerCase()];
}

function generateFilterOptions(currentFilter, defaultFilter) {
    if (!currentFilter || !currentFilter.option || !currentFilter.option.filters || currentFilter.option.filter === 0)
        return defaultFilter;

    // if (currentFilter.option.filters.length === 1 || !currentFilter.option.logic) {
    //     const filter = currentFilter.option.filters[0];
    //     defaultFilter[filter.fieldName] = filterService.getValueOptions(filter);

    //     return defaultFilter;
    // }

    console.log('Default filter: ', defaultFilter);
    let customFilter = { ...defaultFilter };

    const nodes = currentFilter.option.logic
        ? currentFilter.option.logic.split(" ")
        : ['1'];
    console.log('Logic nodes: ', nodes.join());

    let prevOperator;
    const groupedQueries = [];
    for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index];
        const prev = index > 0 ? nodes[index - 1] : null;
        const next = index < nodes.length - 1 ? nodes[index + 1] : null;

        const findFilter = (name) => {
            return currentFilter.option.filters.find(f => f.name === name);
        };

        if (node === "and" && prevOperator === "and") {
            const filter = findFilter(next);
            const query = { [filter.fieldName]: filterService.getValueOptions(filter) };
            const currentParent = groupedQueries[groupedQueries.length - 1];
            currentParent.values.push(query);
        } else if (node === "and") {
            const leftFilter = findFilter(prev);
            const rightFilter = findFilter(next);
            const group = {
                operator: "and",
                values: [
                    { [leftFilter.fieldName]: filterService.getValueOptions(leftFilter) },
                    { [rightFilter.fieldName]: filterService.getValueOptions(rightFilter) }
                ]
            };
            groupedQueries.push(group);
        } else if (node !== "or" && prev !== "and" && next !== "and") {
            const filter = findFilter(node);
            const query = { [filter.fieldName]: filterService.getValueOptions(filter) };
            groupedQueries.push(query);
        }

        prevOperator = node === "and" || node === "or" ? node : prevOperator;
    }

    console.log('Grouped queries: ', groupedQueries.map((a) => JSON.stringify(a)));

    if (groupedQueries.length > 1) {
        customFilter[Op.or] = groupedQueries.map(q => {
            if (q.operator === 'and') {
                return { [Op.and]: q.values };
            }
            return q;
        });
    } else {
        const query = groupedQueries[0];
        if (query.operator === 'and') {
            customFilter[Op.and] = query.values;
        } else {
            customFilter = { ...customFilter, ...query };
        }
    }
    console.log('Custom filter: ', customFilter);

    return customFilter;
}

async function getHcps(req, res) {
    const response = new Response({}, []);

    try {
        const page = req.query.page ? +req.query.page - 1 : 0;
        const limit = 15;
        let status = req.query.status === undefined ? null : req.query.status;
        if (status && status.indexOf(',') !== -1) status = status.split(',');
        const codbase = req.query.codbase === 'undefined' ? null : req.query.codbase;
        const offset = page * limit;

        const [userPermittedApplications, userPermittedCountries] = await getUserPermissions(req.user.id);

        async function getCountryIso2() {
            const user_codbase_list_for_iso2 = (await sequelize.datasyncConnector.query(
                `SELECT * FROM ciam.vwcountry where ciam.vwcountry.country_iso2 = ANY($countries);`, {
                bind: {
                    countries: userPermittedCountries
                },
                type: QueryTypes.SELECT
            }
            )).map(i => i.codbase);

            const user_country_iso2_list = (await sequelize.datasyncConnector.query(
                `SELECT * FROM ciam.vwcountry where ciam.vwcountry.codbase = ANY($codbases);`,
                {
                    bind: {
                        codbases: user_codbase_list_for_iso2
                    },
                    type: QueryTypes.SELECT
                }
            )).map(i => i.country_iso2);

            return user_country_iso2_list;
        }

        const country_iso2_list = await getCountryIso2();
        const ignorecase_of_country_iso2_list = [].concat.apply([], country_iso2_list.map(i => ignoreCaseArray(i)));

        const country_iso2_list_for_codbase = (await sequelize.datasyncConnector.query(
            `SELECT * FROM ciam.vwcountry WHERE ciam.vwcountry.codbase = $codbase;`, {
            bind: {
                codbase: codbase || ''
            },
            type: QueryTypes.SELECT
        }
        )).map(i => i.country_iso2);

        const selected_iso2_list_for_codbase = country_iso2_list_for_codbase.filter(i => country_iso2_list.includes(i));
        const ignorecase_of_selected_iso2_list_for_codbase = [].concat.apply([], selected_iso2_list_for_codbase.map(i => ignoreCaseArray(i)));

        const specialty_list = await sequelize.datasyncConnector.query("SELECT * FROM ciam.vwspecialtymaster", { type: QueryTypes.SELECT });

        const hcp_filter = {
            status: status === null
                ? { [Op.or]: ['self_verified', 'manually_verified', 'consent_pending', 'not_verified', null] }
                : status,
            application_id: userPermittedApplications.length
                ? userPermittedApplications.map(app => app.id)
                : null,
            country_iso2: codbase
                ? ignorecase_of_selected_iso2_list_for_codbase.length
                    ? ignorecase_of_selected_iso2_list_for_codbase
                    : null
                : ignorecase_of_country_iso2_list.length
                    ? ignorecase_of_country_iso2_list
                    : null,
        };

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

        const currentFilter = await Filter.findOne({
            where: { user_id: req.user.id, table_name: 'cdp-users' }
        });

        const filterOptions = generateFilterOptions(currentFilter, hcp_filter);

        const hcps = await Hcp.findAll({
            where: filterOptions,
            include: [{
                model: HcpConsents,
                as: 'hcpConsents',
                attributes: ['consent_id', 'consent_confirmed', 'opt_type'],
            }],
            attributes: { exclude: ['password', 'created_by', 'updated_by'] },
            offset,
            limit,
            order: order
        });

        // await Promise.all(hcps.map(async hcp => {
        //     const opt_types = new Set();

        //     await Promise.all(hcp['hcpConsents'].map(async hcpConsent => {

        //         if (hcpConsent.consent_confirmed) {
        //             const country_consent = await ConsentCountry.findOne({
        //                 where: {
        //                     consent_id: hcpConsent.consent_id,
        //                     country_iso2: {
        //                         [Op.iLike]: hcp.country_iso2
        //                     },
        //                 }
        //             });
        //             opt_types.add(country_consent.opt_type);
        //         }
        //     }));

        //     hcp.dataValues.opt_types = [...opt_types];
        //     delete hcp.dataValues['hcpConsents'];
        // }));

        hcps.map(hcp => {
            const opt_types = new Set();

            hcp['hcpConsents'].map(hcpConsent => {
                if(hcpConsent.consent_confirmed || hcpConsent.opt_type === 'opt-out') {
                    opt_types.add(hcpConsent.opt_type);
                }
            });

            hcp.dataValues.opt_types = [...opt_types];
            delete hcp.dataValues['hcpConsents'];
        });

        const totalUser = await Hcp.count({//counting total data for pagintaion
            where: filterOptions
        });

        const hcp_users = [];
        hcps.forEach(user => {//add specialty name from data sync
            const specialties = specialty_list.filter(i => i.cod_id_onekey === user.specialty_onekey);
            const specialtyInEnglish = specialties && specialties.find(s => s.cod_locale === 'en');
            (specialtyInEnglish)
                ? user.dataValues.specialty_description = specialtyInEnglish.cod_description
                : specialties.length
                    ? user.dataValues.specialty_description = specialties[0].cod_description
                    : user.dataValues.specialty_description = null;
            hcp_users.push(user);
        });

        const data = {
            users: hcp_users,
            page: page + 1,
            limit,
            total: totalUser,
            start: limit * page + 1,
            end: offset + limit > totalUser ? totalUser : offset + limit,
            status: status ? status : null,
            codbase: codbase ? codbase : null,
            countries: userPermittedCountries
        };

        response.data = data;
        res.json(response);
    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function editHcp(req, res) {
    const { first_name, last_name, telephone } = req.body;
    const response = new Response({}, []);

    if (!first_name) {
        response.errors.push(new CustomError('First name is missing.', 400, 'first_name'));
    } else if (first_name.length > 50) {
        response.errors.push(new CustomError('First name should be at most 50 characters', 400, 'first_name'));
    }

    if (!last_name) {
        response.errors.push(new CustomError('Last name is missing.', 400, 'last_name'));
    } else if (last_name.length > 50) {
        response.errors.push(new CustomError('Last name should be at most 50 characters', 400, 'last_name'));
    }

    if (telephone && telephone.length > 25) {
        response.errors.push(new CustomError('Telephone number should be at most 25 digits including country code', 400, 'telephone'));
    }

    if (response.errors.length) {
        return res.status(400).send(response);
    }

    try {
        const HcpUser = await Hcp.findOne({ where: { id: req.params.id } });

        if (!HcpUser) {
            response.errors.push(new CustomError('User not found', 404));
            return res.status(404).send(response);
        }

        HcpUser.update({ first_name, last_name, telephone });

        delete HcpUser.dataValues.password;
        delete HcpUser.dataValues.created_by;
        delete HcpUser.dataValues.updated_by;

        await logService.log({
            event_type: 'UPDATE',
            object_id: HcpUser.id,
            table_name: 'hcp_profiles',
            actor: req.user.id,
            remarks: 'Updated HCP profile'
        });

        response.data = HcpUser;
        res.json(response);
    } catch (err) {
        console.error(err);
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
        if(!Array.isArray(Hcps)) {
            response.error.push(new CustomError('Must be an array', 400));
            return res.status(400).send(response);
        }

        await Promise.all(Hcps.map(async hcp => {
            const { id, email, first_name, last_name, uuid, specialty_onekey, country_iso2, telephone, _rowIndex } = trimRequestBody(hcp);

            if(!id) {
                response.errors.push(new Error(_rowIndex, 'id', 'ID is missing.'));
            }

            const HcpUser = await Hcp.findOne({ where: { id: id } });

            if (!HcpUser) {
                response.errors.push(new Error(_rowIndex, 'id', 'User not found.'));
            }

            if(email) {
                if(!validator.isEmail(email)) {
                    response.errors.push(new Error(_rowIndex, 'email', 'Invalid email'));
                }else{
                    const doesEmailExist = await Hcp.findOne({
                        where: {
                            id: { [Op.ne]: id },
                            email: { [Op.iLike]: `${email}` } }
                        }
                    );

                    if(doesEmailExist) {
                        response.errors.push(new Error(_rowIndex, 'email', 'Email already exists'));
                    }

                    if(emailsToUpdate.has(email)) {
                        emailsToUpdate.get(email).push(_rowIndex);
                    }else{
                        emailsToUpdate.set(email, [_rowIndex]);
                    }
                }
            }

            let uuid_from_master_data;

            if(uuid) {
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

                if(uuidsToUpdate.has(uuid_from_master_data || uuid)) {
                    uuidsToUpdate.get(uuid_from_master_data || uuid).push(_rowIndex);
                }else{
                    uuidsToUpdate.set(uuid_from_master_data || uuid, [_rowIndex]);
                }
            }

            hcpsToUpdate.push({
                uuid: uuid_from_master_data || uuid,
                email,
                first_name,
                last_name,
                specialty_onekey,
                country_iso2,
                telephone
            });

            HcpUser.dataValues._rowIndex = _rowIndex;
            hcpModelInstances.push(HcpUser);
        }));

        emailsToUpdate.forEach((listOfIndex) => {
            if(listOfIndex.length > 1) {
                listOfIndex.map(ind => response.errors.push(new Error(ind, 'email', 'Email matches with another row.')))
            }
        })

        uuidsToUpdate.forEach((listOfIndex) => {
            if(listOfIndex.length > 1) {
                listOfIndex.map(ind => response.errors.push(new Error(ind, 'uuid', 'UUID matches with another row.')))
            }
        })

        if(response.errors && response.errors.length) {
            return res.status(400).send(response);
        }

        await Promise.all(hcpModelInstances.map(async (hcp, index) => {
            const updatedPropertiesLog = [];

            Object.keys(hcpsToUpdate[index]).forEach(key => {
                if(hcpsToUpdate[index][key]) {
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
                changes: JSON.stringify(allUpdateRecordsForLogging[index])
            });
        }));

        hcpModelInstances.map((hcpModelIns, idx) => {
            const { _rowIndex } = hcpModelIns.dataValues;
            Object.keys(hcpsToUpdate[idx]).forEach(key => {
                if(hcpsToUpdate[idx][key]) response.data.push(new Data(_rowIndex, key, hcpModelIns.dataValues[key]));
            })
        });

        res.json(response);
    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function registrationLookup(req, res) {
    const { email, uuid } = req.body;

    const response = new Response({}, []);

    if (!email || !validator.isEmail(email)) {
        response.errors.push(new CustomError('Email address is missing or invalid.', 400, 'email'));
    }

    if (!uuid) {
        response.errors.push(new CustomError('UUID is missing.', 400, 'uuid'));
    }

    if (response.errors.length) {
        return res.status(400).send(response);
    }

    try {
        const profileByEmail = await Hcp.findOne({ where: where(fn('lower', col('email')), fn('lower', email)) });

        if (profileByEmail) {
            response.errors.push(new CustomError('Email address is already registered.', 4001, 'email'));
            return res.status(400).send(response);
        }

        const uuidWithoutSpecialCharacter = uuid.replace(/[-/]/gi, '');

        const master_data = await sequelize.datasyncConnector.query(`
            SELECT h.*, s.specialty_code
            FROM ciam.vwhcpmaster AS h
            INNER JOIN ciam.vwmaphcpspecialty AS s
            ON s.individual_id_onekey = h.individual_id_onekey
            WHERE regexp_replace(h.uuid_1, '[-]', '', 'gi') = $uuid
            OR regexp_replace(h.uuid_2, '[-]', '', 'gi') = $uuid
        `, {
            bind: { uuid: uuidWithoutSpecialCharacter },
            type: QueryTypes.SELECT
        });

        let uuid_from_master_data;

        if (master_data && master_data.length) {
            const uuid_1_from_master_data = (master_data[0].uuid_1 || '');
            const uuid_2_from_master_data = (master_data[0].uuid_2 || '');

            uuid_from_master_data = [uuid_1_from_master_data, uuid_2_from_master_data]
                .find(id => id.replace(/[-/]/gi, '') === uuidWithoutSpecialCharacter);
        }

        const profileByUUID = await Hcp.findOne({ where: { uuid: uuid_from_master_data || uuid } });

        if (profileByUUID) {
            response.errors.push(new CustomError('UUID is already registered.', 4101, 'uuid'));
            return res.status(400).send(response);
        }

        if (master_data && master_data.length) {
            response.data = mapMasterDataToHcpProfile(master_data[0]);
        } else {
            response.errors.push(new CustomError('Invalid UUID.', 4100, 'uuid'));
            return res.status(400).send(response);
        }

        res.json(response);
    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function createHcpProfile(req, res) {
    const response = new Response({}, []);
    const { email, uuid, salutation, first_name, last_name, country_iso2, language_code, specialty_onekey, telephone, birthdate, origin_url } = req.body;
    const hcpValidator = hcpValidation().validate;

    const firstNameValidationStatus = await hcpValidator(first_name, 'first_name');
    const lastNameValidationStatus = await hcpValidator(last_name, 'last_name');
    const telephoneValidationStatus = await hcpValidator(telephone, 'telephone');
    const emailValidationStatus = await hcpValidator(email, 'email');

    if (!email || !validator.isEmail(email)) {
        response.errors.push(new CustomError('Email address is missing or invalid.', 400, 'email'));
    } else if (email.length > 100) {
        response.errors.push(new CustomError('Email should be at most 100 characters', 400, 'email'));
    } else if(!emailValidationStatus.valid) {
        response.errors.push(new CustomError(emailValidationStatus.errors[0], 400, 'email'));
    }

    if (!uuid) {
        response.errors.push(new CustomError('UUID is missing.', 400, 'uuid'));
    } else if (uuid.length > 20) {
        response.errors.push(new CustomError('UUID should be at most 20 characters', 400, 'uuid'));
    }

    if (!salutation) {
        response.errors.push(new CustomError('Salutation is missing.', 400, 'salutation'));
    } else if (salutation.length > 5) {
        response.errors.push(new CustomError('Salutation should be at most 5 characters', 400, 'salutation'));
    }

    if (!first_name) {
        response.errors.push(new CustomError('First name is missing.', 400, 'first_name'));
    } else if (first_name.length > 50) {
        response.errors.push(new CustomError('First name should be at most 50 characters', 400, 'first_name'));
    } else if(!firstNameValidationStatus.valid) {
        response.errors.push(new CustomError(firstNameValidationStatus.errors[0], 400, 'first_name'));
    }

    if (!last_name) {
        response.errors.push(new CustomError('Last name is missing.', 400, 'last_name'));
    } else if (last_name.length > 50) {
        response.errors.push(new CustomError('Last name should be at most 50 characters', 400, 'last_name'));
    } else if(!lastNameValidationStatus.valid) {
        response.errors.push(new CustomError(lastNameValidationStatus.errors[0], 400, 'last_name'));
    }

    if (!country_iso2) {
        response.errors.push(new CustomError('country_iso2 is missing.', 400, 'country_iso2'));
    } else if (country_iso2.length > 2) {
        response.errors.push(new CustomError('Country code should be at most 2 characters', 400, 'country_iso2'));
    }

    if (!language_code) {
        response.errors.push(new CustomError('language_code is missing.', 400, 'language_code'));
    } else if (language_code.length > 2) {
        response.errors.push(new CustomError('Language code should be at most 2 characters', 400, 'language_code'));
    }

    if (!specialty_onekey) {
        response.errors.push(new CustomError('specialty_onekey is missing.', 400, 'specialty_onekey'));
    }

    if (!origin_url) {
        response.errors.push(new CustomError('Origin URL is missing.', 400, 'origin_url'));
    }

    if (telephone && telephone.length > 25) {
        response.errors.push(new CustomError('Telephone number should be at most 25 digits including country code', 400, 'telephone'));
    } else if(!telephoneValidationStatus.valid) {
        response.errors.push(new CustomError(telephoneValidationStatus.errors[0], 400, 'telephone'));
    }

    if (specialty_onekey.length > 20) {
        response.errors.push(new CustomError('Specialty Onekey should be at most 20 characters', 400, 'specialty_onekey'));
    } else if (specialty_onekey) {
        const specialty_master_data = await sequelize.datasyncConnector.query("SELECT * FROM ciam.vwspecialtymaster WHERE cod_id_onekey = $specialty_onekey", {
            bind: { specialty_onekey },
            type: QueryTypes.SELECT
        });

        if (!specialty_master_data.length) {
            response.errors.push(new CustomError('specialty_onekey is invalid.', 400, 'specialty_onekey'));
        }
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
            origin_url,
            created_by: req.user.id,
            updated_by: req.user.id
        };

        const hcpUser = await Hcp.create(model);

        const countries = await sequelize.datasyncConnector.query('SELECT * FROM ciam.vwcountry ORDER BY codbase_desc, countryname;', { type: QueryTypes.SELECT });

        let hasDoubleOptIn = false;
        const consentArr = [];

        if (req.body.consents && req.body.consents.length) {
            await Promise.all(req.body.consents.map(async consent => {
                const preferenceSlug = Object.keys(consent)[0];
                const consentResponse = Object.values(consent)[0];

                if (!consentResponse) return;

                const consentDetails = await Consent.findOne({ where: { slug: preferenceSlug } });

                if (!consentDetails) return;

                const currentCountry = countries.find(c => c.country_iso2.toLowerCase() === model.country_iso2.toLowerCase());

                const baseCountry = countries.find(c => c.countryname === currentCountry.codbase_desc);

                const consentCountry = await ConsentCountry.findOne({
                    where: {
                        country_iso2: {
                            [Op.iLike]: baseCountry.country_iso2
                        },
                        consent_id: consentDetails.id
                    }
                });

                if (!consentCountry) return;

                if (consentCountry.opt_type === 'double-opt-in') {
                    hasDoubleOptIn = true;
                }

                consentArr.push({
                    user_id: hcpUser.id,
                    consent_id: consentDetails.id,
                    consent_confirmed: consentCountry.opt_type === 'double-opt-in' ? false : true,
                    opt_type: consentCountry.opt_type,
                    created_by: req.user.id,
                    updated_by: req.user.id
                });
            }));

            consentArr.length && await HcpConsents.bulkCreate(consentArr, {
                returning: true,
                ignoreDuplicates: false
            });
        }

        hcpUser.status = master_data.individual_id_onekey ? hasDoubleOptIn ? 'consent_pending' : 'self_verified' : 'not_verified';
        await hcpUser.save();

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
            actor: req.user.id,
            remarks: 'HCP user created'
        });

        res.json(response);
    } catch (err) {
        console.error(err);
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
            userConsents = userConsents.map(consent => ({ ...consent.dataValues, consent_confirmed: true }));

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
        console.error(err);
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
            console.error(e);
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
        console.error(err);
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

        await HcpArchives.create({ ...hcpUser.dataValues, status: 'rejected' });

        response.data = getHcpViewModel(hcpUser.dataValues);

        await logService.log({
            event_type: 'CREATE',
            object_id: hcpUser.id,
            table_name: 'hcp_archives',
            actor: req.user.id,
            remarks: (req.body.comment || '').trim()
        });

        await hcpUser.destroy();

        res.json(response);
    } catch (err) {
        console.error(err);
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
        console.error(err);
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
            attributes: ['consent_id', 'consent_confirmed', 'opt_type', 'updated_at']
        });

        if (!userConsents) return res.json([]);

        let userConsentDetails = await ConsentLocale.findAll({
            where: {
                consent_id: userConsents.map(consent => consent.consent_id),
                locale: {
                    [Op.iLike]: `%${doc.locale}`
                }
            }, attributes: ['consent_id', 'rich_text']
        });

        if(userConsentDetails) {
            const codbaseCountry = await sequelize.datasyncConnector.query(`
                SELECT * FROM ciam.vwcountry
                WHERE countryname = (SELECT codbase_desc FROM ciam.vwcountry
                WHERE LOWER(ciam.vwcountry.country_iso2) = $country_iso2);`, {
                bind: {
                    country_iso2: doc.country_iso2.toLowerCase()
                },
                type: QueryTypes.SELECT
            });

            const localeUsingParentCountryISO = `${doc.language_code}_${codbaseCountry[0].country_iso2}`;

            userConsentDetails = await ConsentLocale.findAll({
                where: {
                    consent_id: userConsents.map(consent => consent.consent_id),
                    locale: {
                        [Op.iLike]: `%${localeUsingParentCountryISO}`
                    }
                }, attributes: ['consent_id', 'rich_text']
            });
        }

        response.data = userConsents.map(userConsent => {
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
        });

        res.json(response);
    } catch (err) {
        console.error(err);
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

    if (!email || !current_password || !new_password || !confirm_password) {
        response.errors.push(new CustomError('Missing required parameters.', 400));
        return res.status(400).send(response);
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
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function resetPassword(req, res) {
    const response = new Response({}, []);

    async function log(object_id, actor, message, event_type="BAD_REQUEST") {
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

        if(wasAccountLocked) await log(doc.id, req.user.id, 'HCP Password reset success. Account unlocked', 'UPDATE');
        else await log(doc.id, req.user.id, 'HCP Password reset success', 'UPDATE');

        res.json(response);
    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function forgetPassword(req, res) {
    const response = new Response({}, []);
    const { email } = req.body;

    try {
        if (!email) {
            response.errors.push(new CustomError('Missing required parameters.', 400));
            return res.status(400).send(response);
        }

        if (!validator.isEmail(email)) {
            response.errors.push(new CustomError('The email address format is invalid.', 4000, 'email'));
            return res.status(400).send(response);
        }

        const doc = await Hcp.findOne({
            where: where(fn('lower', col('email')), fn('lower', email))
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
        console.error(err);
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

        const countries = await sequelize.datasyncConnector.query(`
            SELECT * FROM ciam.vwcountry
            WHERE LOWER(ciam.vwcountry.country_iso2) = $country_iso2;`, {
            bind: {
                country_iso2: country_iso2.toLowerCase()
            },
            type: QueryTypes.SELECT
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
        console.error(err);
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

        const countries = await sequelize.datasyncConnector.query(`
            SELECT * FROM ciam.vwcountry
            WHERE LOWER(ciam.vwcountry.country_iso2) = $country_iso2;`, {
            bind: {
                country_iso2: country_iso2.toLowerCase()
            },
            type: QueryTypes.SELECT
        });

        if (!countries || !countries.length) {
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
                codbase: countries[0].codbase.toLowerCase()
            },
            type: QueryTypes.SELECT
        });

        if (!masterDataSpecialties.length) {
            const codbaseCountry = await sequelize.datasyncConnector.query(`
                SELECT * FROM ciam.vwcountry
                WHERE LOWER(countryname) = $codbase_desc;`, {
                bind: {
                    codbase_desc: countries[0].codbase_desc.toLowerCase()
                },
                type: QueryTypes.SELECT
            });

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
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getAccessToken(req, res) {
    const response = new Response({}, []);

    try {
        const { email, password } = req.body;

        if (!email) {
            response.errors.push(new CustomError('Email is required.', 400, 'email'));
        }

        if (!password) {
            response.errors.push(new CustomError('Password is required.', 400, 'password'));
        }

        if (!email || !password) {
            return res.status(400).json(response);
        }

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
            } else if(doc && doc.password && !doc.validPassword(password)) {
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
        console.error(err);
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

        if (!req.body.consents) response.errors.push(new CustomError('consents are missing.', 400, 'consents'));

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
        console.error(err);
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
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getHcps = getHcps;
exports.editHcp = editHcp;
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
