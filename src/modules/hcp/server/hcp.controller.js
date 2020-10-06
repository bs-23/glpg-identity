const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { QueryTypes, Op, where, col, fn } = require('sequelize');
const Hcp = require('./hcp_profile.model');
const ApplicationDomain = require('../../application/server/application-domain.model');
const HcpArchives = require(path.join(process.cwd(), 'src/modules/hcp/server/hcp_archives.model'));
const HcpConsents = require(path.join(process.cwd(), 'src/modules/hcp/server/hcp_consents.model'));
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));
const Consent = require(path.join(process.cwd(), 'src/modules/consent/server/consent.model'));
const ConsentLocale = require(path.join(process.cwd(), 'src/modules/consent/server/consent-locale.model'));
const ConsentCountry = require(path.join(process.cwd(), 'src/modules/consent/server/consent-country.model'));
const Application = require(path.join(process.cwd(), 'src/modules/application/server/application.model'));
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const emailService = require(path.join(process.cwd(), 'src/config/server/lib/email-service/email.service'));
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const PasswordPolicies = require(path.join(process.cwd(), 'src/modules/core/server/password/password-policies.js'));

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

async function generateEmailOptions(emailType, application, user) {
    const emailDataUrl = path.join(process.cwd(), `src/config/server/lib/email-service/email-options.json`);
    const emailOptionsText = fs.readFileSync(emailDataUrl, 'utf8');
    const emailOptions = JSON.parse(emailOptionsText);
    const emailData = emailOptions[emailType];

    let templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/${application.slug}/en/${emailData.template_url}`)
    const templateUrlInLocale = path.join(process.cwd(), `src/config/server/lib/email-service/templates/${application.slug}/${user.locale.toLowerCase()}/${emailData.template_url}`);

    if (fs.existsSync(templateUrlInLocale)) {
        templateUrl = templateUrlInLocale;
    }

    const subject = emailData.subject[user.locale] || emailData.subject['en'];
    const plaintext = emailData.plain_text[user.locale] || emailData.plain_text['en'];

    const { domain } = await ApplicationDomain.findOne({ where: { application_id: application.id, country_iso2: user.country_iso2 }});

    return {
        toAddresses: [user.email],
        subject: subject,
        templateUrl: templateUrl,
        plaintext: plaintext,
        domain,
        data: {
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            s3bucketUrl: nodecache.getValue('S3_BUCKET_URL')
        }
    };
}

async function sendConsentConfirmationMail(user, consents, application) {
    const consentConfirmationToken = generateConsentConfirmationAccessToken(user);

    const mailOptions = await generateEmailOptions('double-opt-in-consent-confirm', application, user);
    mailOptions.data.consents = consents || [];
    mailOptions.data.link = `${mailOptions.domain}${application.consent_confirmation_path}?token=${consentConfirmationToken}&journey=consent_confirmation&country_lang=${user.country_iso2.toLowerCase()}_${user.language_code.toLowerCase()}`;

    await emailService.send(mailOptions);
}

async function sendRegistrationSuccessMail(user, application) {
    const mailOptions = await generateEmailOptions('registration-success', application, user);
    mailOptions.data.loginLink = `${mailOptions.domain}${application.journey_redirect_path}?journey=login&country_lang=${user.country_iso2.toLowerCase()}_${user.language_code.toLowerCase()}`;

    await emailService.send(mailOptions);
}

async function sendChangePasswordSuccessMail(user, application) {
    const mailOptions = await generateEmailOptions('password-change-success', application, user);
    await emailService.send(mailOptions);
}

async function sendRegistrationNotVerifiedMail(user, application) {
    const mailOptions = await generateEmailOptions('registration-not-verified', application, user);
    await emailService.send(mailOptions);
}

async function sendResetPasswordSuccessMail(user, application) {
    const mailOptions = await generateEmailOptions('password-reset-success', application, user);
    mailOptions.data.loginLink = `${mailOptions.domain}${application.journey_redirect_path}?journey=login&country_lang=${user.country_iso2.toLowerCase()}_${user.language_code.toLowerCase()}`;

    await emailService.send(mailOptions);
}

async function sendPasswordSetupInstructionMail(user, application) {
    const mailOptions = await generateEmailOptions('password-setup-instructions', application, user);
    mailOptions.data.link = `${mailOptions.domain}${application.journey_redirect_path}?token=${user.reset_password_token}&journey=single_optin_verified&country_lang=${user.country_iso2.toLowerCase()}_${user.language_code.toLowerCase()}`;
    mailOptions.data.forgot_password_link = `${mailOptions.domain}${application.journey_redirect_path}?journey=forgot_password&country_lang=${user.country_iso2.toLowerCase()}_${user.language_code.toLowerCase()}`;

    await emailService.send(mailOptions);
}

async function sendPasswordResetInstructionMail(user, application) {
    const mailOptions = await generateEmailOptions('password-reset-instructions', application, user);
    mailOptions.data.link = `${mailOptions.domain}${application.journey_redirect_path}?token=${user.reset_password_token}&journey=set_password&country_lang=${user.country_iso2.toLowerCase()}_${user.language_code.toLowerCase()}`;

    await emailService.send(mailOptions);
}

async function addPasswordResetTokenToUser(user) {
    user.reset_password_token = crypto.randomBytes(36).toString('hex');
    user.reset_password_expires = Date.now() + 3600000;

    await user.save();
}

function ignoreCaseArray(str) {
    return [str.toLowerCase(), str.toUpperCase(), str.charAt(0).toLowerCase() + str.charAt(1).toUpperCase(), str.charAt(0).toUpperCase() + str.charAt(1).toLowerCase()];
}

async function getHcps(req, res) {
    const response = new Response({}, []);

    try {
        const page = req.query.page ? parseInt(req.query.page) - 1 : 0;
        const limit = 15;
        let status = req.query.status === undefined ? null : req.query.status;
        if (status && status.indexOf(',') !== -1) status = status.split(',');
        const codbase = req.query.codbase === 'undefined' ? null : req.query.codbase;
        const offset = page * limit;

        const application_list = (await Hcp.findAll()).map(i => i.get("application_id"));

        async function getCountryIso2(){
            const user_codbase_list_for_iso2 = (await sequelize.datasyncConnector.query(
                `SELECT * FROM ciam.vwcountry where ciam.vwcountry.country_iso2 = ANY($countries);`, {
                    bind: {
                        countries: req.user.countries
                    },
                    type: QueryTypes.SELECT
                }
            )).map(i => i.codbase);

            const user_country_iso2_list = (await sequelize.datasyncConnector.query(
                `SELECT * FROM ciam.vwcountry where ciam.vwcountry.codbase = ANY($codbases);`,
                {
                    bind: {
                        codbases : user_codbase_list_for_iso2
                    },
                    type: QueryTypes.SELECT
                }
            )).map(i => i.country_iso2);

            return user_country_iso2_list;
        }

        const country_iso2_list = await getCountryIso2();
        const ignorecase_of_country_iso2_list = [].concat.apply([], country_iso2_list.map(i => ignoreCaseArray(i)));

        const country_iso2_list_for_codbase = (await sequelize.datasyncConnector.query(
            `SELECT * FROM ciam.vwcountry WHERE ciam.vwcountry.codbase = '${codbase}';`,
            {
                logging: console.log,
                type: QueryTypes.SELECT
            }
        )).map(i => i.country_iso2);

        const selected_iso2_list_for_codbase = country_iso2_list_for_codbase.filter(i => country_iso2_list.includes(i));
        const ignorecase_of_selected_iso2_list_for_codbase = [].concat.apply([], selected_iso2_list_for_codbase.map(i => ignoreCaseArray(i)));

        const specialty_list = await sequelize.datasyncConnector.query("SELECT * FROM ciam.vwspecialtymaster", { type: QueryTypes.SELECT });

        const hcp_filter = {
            status: status === null ? { [Op.or]: ['self_verified', 'manually_verified', 'consent_pending', 'not_verified', null] } : status,
            application_id: req.user.type === 'admin' ? { [Op.or]: application_list } : req.user.application_id,
            country_iso2: codbase ? { [Op.any]: [ignorecase_of_selected_iso2_list_for_codbase] } : { [Op.any]: [ignorecase_of_country_iso2_list] },
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

        const hcps = await Hcp.findAll({
            where: hcp_filter,
            include: [{
                model: HcpConsents,
                as: 'hcpConsents',
                attributes: ['consent_id', 'response', 'consent_confirmed'],
            }],
            attributes: { exclude: ['password', 'created_by', 'updated_by'] },
            offset,
            limit,
            order: order
        });

        await Promise.all(hcps.map(async hcp => {
            const opt_types = new Set();

            await Promise.all(hcp['hcpConsents'].map(async hcpConsent => {

                if (hcpConsent.response && hcpConsent.consent_confirmed) {
                    const country_consent = await ConsentCountry.findOne({ where: { consent_id: hcpConsent.consent_id } });
                    opt_types.add(country_consent.opt_type);
                }
            }));

            hcp.dataValues.opt_types = [...opt_types];
            delete hcp.dataValues['hcpConsents'];
        }));

        const totalUser = await Hcp.count({//counting total data for pagintaion
            where: hcp_filter
        });

        const hcp_users = [];
        hcps.forEach(user => {//add specialty name from data sync
            const specialty = specialty_list.find(i => i.cod_id_onekey === user.specialty_onekey);
            (specialty) ? user.dataValues.specialty_description = specialty.cod_description : user.dataValues.specialty_description = null;
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
            countries: req.user.countries
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

        response.data = HcpUser;
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
        const profileByUUID = await Hcp.findOne({ where: { uuid } });

        if (profileByEmail) {
            response.errors.push(new CustomError('Email address is already registered.', 4001, 'email'));
            return res.status(400).send(response);
        } else if (profileByUUID) {
            response.errors.push(new CustomError('UUID is already registered.', 4101, 'uuid'));
            return res.status(400).send(response);
        } else {
            const master_data = await sequelize.datasyncConnector.query(`
                SELECT h.*, s.specialty_code
                FROM ciam.vwhcpmaster AS h
                INNER JOIN ciam.vwmaphcpspecialty AS s
                ON s.individual_id_onekey = h.individual_id_onekey
                WHERE h.uuid_1 = $uuid OR h.uuid_2 = $uuid
            `, {
                bind: { uuid },
                type: QueryTypes.SELECT
            });

            if (master_data && master_data.length) {
                response.data = mapMasterDataToHcpProfile(master_data[0]);
            } else {
                response.errors.push(new CustomError('Invalid UUID.', 4100, 'uuid'));
                return res.status(400).send(response);
            }
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
    const { email, uuid, salutation, first_name, last_name, country_iso2, language_code, specialty_onekey, telephone, locale } = req.body;

    if (!email || !validator.isEmail(email)) {
        response.errors.push(new CustomError('Email address is missing or invalid.', 400, 'email'));
    }

    if (!uuid) {
        response.errors.push(new CustomError('UUID is missing.', 400, 'uuid'));
    }

    if (!salutation) {
        response.errors.push(new CustomError('Salutation is missing.', 400, 'salutation'));
    }

    if (!first_name) {
        response.errors.push(new CustomError('First name is missing.', 400, 'first_name'));
    }

    if (!last_name) {
        response.errors.push(new CustomError('Last name is missing.', 400, 'last_name'));
    }

    if (!country_iso2) {
        response.errors.push(new CustomError('country_iso2 is missing.', 400, 'country_iso2'));
    }

    if (!language_code) {
        response.errors.push(new CustomError('language_code is missing.', 400, 'language_code'));
    }

    if (!locale) {
        response.errors.push(new CustomError('locale is missing.', 400, 'locale'));
    }

    if (!specialty_onekey) {
        response.errors.push(new CustomError('specialty_onekey is missing.', 400, 'specialty_onekey'));
    }

    if (specialty_onekey) {
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
        const isUUIDExists = await Hcp.findOne({ where: { uuid: req.body.uuid } });

        if (isEmailExists) {
            response.errors.push(new CustomError('Email already exists.', 4001, 'email'));
        }

        if (isUUIDExists) {
            response.errors.push(new CustomError('UUID already exists.', 4101, 'uuid'));
        }

        if (response.errors.length) {
            return res.status(400).send(response);
        }

        let master_data = {};

        if (req.body.uuid) {
            master_data = await sequelize.datasyncConnector.query('SELECT * FROM ciam.vwhcpmaster WHERE uuid_1 = $uuid OR uuid_2 = $uuid', {
                bind: { uuid: req.body.uuid },
                type: QueryTypes.SELECT
            });
            master_data = master_data && master_data.length ? master_data[0] : {};
        }

        const model = {
            email: email.toLowerCase(),
            uuid,
            salutation,
            first_name,
            last_name,
            language_code: language_code.toLowerCase(),
            country_iso2: country_iso2.toLowerCase(),
            locale: locale.toLowerCase(),
            specialty_onekey,
            telephone,
            application_id: req.user.id,
            individual_id_onekey: master_data.individual_id_onekey,
            created_by: req.user.id,
            updated_by: req.user.id
        };

        const hcpUser = await Hcp.create(model);

        let hasDoubleOptIn = false;
        const consentArr = [];

        if (req.body.consents && req.body.consents.length) {
            await Promise.all(req.body.consents.map(async consent => {
                const consentSlug = Object.keys(consent)[0];
                const consentResponse = Object.values(consent)[0];

                if (!consentResponse) return;

                const consentDetails = await Consent.findOne({ where: { slug: consentSlug } });
                if (!consentDetails) return;

                const consentLocale = await ConsentLocale.findOne({
                    where: {
                        locale: model.locale.toLowerCase(),
                        consent_id: consentDetails.id
                    }
                });

                const consentCountry = await ConsentCountry.findOne({
                    where: {
                        country_iso2: model.country_iso2.toLowerCase(),
                        consent_id: consentDetails.id
                    }
                });

                if (!consentLocale || !consentCountry) return;

                if (consentCountry.opt_type === 'double-opt-in') {
                    hasDoubleOptIn = true;
                }

                consentArr.push({
                    user_id: hcpUser.id,
                    consent_id: consentDetails.id,
                    title: consentLocale.rich_text,
                    response: consentResponse,
                    consent_confirmed: consentCountry.opt_type === 'double-opt-in' ? false : true,
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

        if (hcpUser.dataValues.status === 'not_verified') {
            await sendRegistrationNotVerifiedMail(hcpUser.dataValues, req.user);
        }

        if (hcpUser.dataValues.status === 'consent_pending') {
            const unconfirmedConsents = consentArr.filter(consent => !consent.consent_confirmed);
            const consentTitles = unconfirmedConsents.map(consent => validator.unescape(consent.title));

            await sendConsentConfirmationMail(hcpUser.dataValues, consentTitles, req.user);
        }

        if (hcpUser.dataValues.status === 'self_verified') {
            await addPasswordResetTokenToUser(hcpUser);

            response.data.password_reset_token = hcpUser.dataValues.reset_password_token;
            response.data.retention_period = '1 hour';
        }

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
            return res.status(404).send(response);
        }

        if (hcpUser.dataValues.status !== 'not_verified') {
            response.errors.push(new CustomError('Invalid user status for this request.', 400));
            return res.status(400).send(response);
        }

        const userApplication = await Application.findOne({ where: { id: hcpUser.application_id } });

        let userConsents = await HcpConsents.findAll({ where: { [Op.and]: [{ user_id: id }, { consent_confirmed: false }] } });

        let hasDoubleOptIn = false;
        const consentTitles = [];

        if (userConsents && userConsents.length) {
            const consentIds = userConsents.map(consent => consent.consent_id)
            const allConsentDetails = await ConsentLocale.findAll({
                where: {
                    consent_id: consentIds,
                    locale: hcpUser.locale.toLowerCase()
                }
            });

            if (allConsentDetails && allConsentDetails.length) {
                hasDoubleOptIn = true;
                allConsentDetails.forEach(consent => consentTitles.push(validator.unescape(consent.rich_text)));
            }
        }

        hcpUser.status = hasDoubleOptIn ? 'consent_pending' : 'manually_verified';
        await hcpUser.save();

        if (hcpUser.dataValues.status === 'consent_pending') {
            await sendConsentConfirmationMail(hcpUser, consentTitles, userApplication);
        }

        if (hcpUser.dataValues.status === 'manually_verified') {
            await addPasswordResetTokenToUser(hcpUser);
            await sendPasswordSetupInstructionMail(hcpUser.dataValues, userApplication);
        }

        response.data = getHcpViewModel(hcpUser.dataValues);

        await logService.log({
            event_type: 'UPDATE',
            object_id: hcpUser.id,
            table_name: 'hcp_profiles',
            created_by: req.user.id,
            description: req.body.comment
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
            created_by: req.user.id,
            description: req.body.comment
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
            attributes: { exclude: ['password', 'created_at', 'updated_at', 'created_by', 'updated_by', 'reset_password_token', 'reset_password_expires', 'application_id'] }
        });

        if (!doc) {
            response.errors.push(new CustomError('Profile not found.', 404));
            return res.status(404).send(response);
        }

        response.data = getHcpViewModel(doc.dataValues);
        res.json(response);
    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getHCPUserConsents(req, res) {
    const response = new Response({}, []);
    const { locale } = req.query;

    try {
        const doc = await Hcp.findOne({
            where: { id: req.params.id }
        });

        if (!doc) {
            response.errors.push(new CustomError('Profile not found.', 404));
            return res.status(404).send(response);
        }

        const userConsents = await HcpConsents.findAll({ where: { user_id: doc.id }, attributes: ['consent_id', 'response', 'consent_confirmed', 'updated_at'] });

        if (!userConsents) return res.json([]);

        const userConsentDetails = await ConsentLocale.findAll({ include: { model: Consent, as: 'consent', attributes: ['title'] }, where: { consent_id: userConsents.map(consent => consent.consent_id), locale: locale ? locale.toLowerCase() : doc.locale }, attributes: ['consent_id', 'rich_text'] });

        const consentCountries = await ConsentCountry.findAll({ where: { consent_id: userConsents.map(consent => consent.consent_id), country_iso2: { [Op.or]: [doc.country_iso2.toUpperCase(), doc.country_iso2.toLowerCase()] } } });

        const consentResponse = userConsentDetails.map(({ consent_id: id, rich_text, consent: { title } }) => ({ id, title, rich_text: validator.unescape(rich_text) }));

        response.data = consentResponse.map(conRes => {
            const matchedConsent = userConsents.find(consent => consent.consent_id === conRes.id);
            const matchedConsentCountries = consentCountries.find(c => c.consent_id === conRes.id);
            conRes.consent_given_time = matchedConsent ? matchedConsent.updated_at : null;
            conRes.opt_type = matchedConsentCountries ? matchedConsentCountries.opt_type : null;
            conRes.consent_given = matchedConsent ? matchedConsent.consent_confirmed && matchedConsent.response ? true : false : null;
            return conRes;
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

        await sendChangePasswordSuccessMail(doc, req.user);

        response.data = 'Password changed successfully.';
        res.send(response);
    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function resetPassword(req, res) {
    const response = new Response({}, []);

    try {
        const doc = await Hcp.findOne({ where: { reset_password_token: req.query.token } });

        if (!doc) {
            response.errors.push(new CustomError('Invalid password reset token.', 4400));
            return res.status(404).send(response);
        }

        if (await PasswordPolicies.minimumPasswordAge(doc.password_updated_at)) {
            response.errors.push(new CustomError(`You cannot change password before 1 day`, 4202));
            return res.status(400).send(response);
        }

        if (doc.reset_password_expires < Date.now()) {
            response.errors.push(new CustomError('Password reset token has been expired. Please request again.', 4400));
            return res.status(400).send(response);
        }

        if (req.body.new_password !== req.body.confirm_password) {
            response.errors.push(new CustomError(`Password and confirm password doesn't match.`, 4201));
            return res.status(400).send(response);
        }

        if (await PasswordPolicies.isOldPassword(req.body.new_password, doc)) {
            response.errors.push(new CustomError(`New password can not be your previously used password.`, 4203));
            return res.status(400).send(response);
        }

        if (!PasswordPolicies.validatePassword(req.body.new_password)) {
            response.errors.push(new CustomError(`Password must contain atleast a digit, an uppercase, a lowercase and a special character and must be 8 to 50 characters long.`, 4200));
            return res.status(400).send(response);
        }

        if (!PasswordPolicies.hasValidCharacters(req.body.new_password)) {
            response.errors.push(new CustomError(`Password has one or more invalid character.`, 4200));
            return res.status(400).send(response);
        }

        if (PasswordPolicies.isCommonPassword(req.body.new_password, doc)) {
            response.errors.push(new CustomError(`Password can not be commonly used passwords or personal info. Try a different one.`, 400));
            return res.status(400).send(response);
        }

        if (req.body.new_password !== req.body.confirm_password) {
            response.errors.push(new CustomError(`Password and confirm password doesn't match.`, 4201));
            return res.status(400).send(response);
        }

        if (doc.password) await PasswordPolicies.saveOldPassword(doc);

        if (doc.password) {
            await sendResetPasswordSuccessMail(doc, req.user);
        } else {
            await sendRegistrationSuccessMail(doc, req.user);
        }

        await doc.update({ password: req.body.new_password, password_updated_at: new Date(Date.now()), reset_password_token: null, reset_password_expires: null });

        await doc.update(
            { failed_auth_attempt: 0 },
            { where: { email: doc.dataValues.email } }
        );

        response.data = 'Password reset successfully.';
        res.send(response);
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
            response.data = 'Successfully sent password reset email.';
            return res.json(response);
        }

        const userApplication = await Application.findOne({ where: { id: doc.application_id } });

        if (doc.dataValues.status === 'self_verified' || doc.dataValues.status === 'manually_verified') {
            await addPasswordResetTokenToUser(doc)

            await sendPasswordResetInstructionMail(doc, userApplication)

            response.data = 'Successfully sent password reset email.'

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
        const locale = req.query.locale;

        if (!locale) {
            response.errors.push(new CustomError(`Missing required query parameter`, 4300, 'locale'));
            return res.status(400).send(response);
        }

        let masterDataSpecialties = await sequelize.datasyncConnector.query(`
            SELECT codbase, cod_id_onekey, cod_locale, cod_description
            FROM ciam.vwspecialtymaster as Specialty
            WHERE LOWER(cod_locale) = $locale
            ORDER BY cod_description ASC;
            `, {
            bind: {
                locale: locale.toLowerCase()
            },
            type: QueryTypes.SELECT
        });

        if (!masterDataSpecialties || masterDataSpecialties.length === 0) {
            const languageCode = locale.split('_')[0];

            masterDataSpecialties = await sequelize.datasyncConnector.query(`
            SELECT codbase, cod_id_onekey, cod_locale, cod_description
            FROM ciam.vwspecialtymaster as Specialty
            WHERE LOWER(cod_locale) = $locale
            ORDER BY cod_description ASC;
            `, {
                bind: {
                    locale: languageCode.toLowerCase()
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

        res.json(response);
    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
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
