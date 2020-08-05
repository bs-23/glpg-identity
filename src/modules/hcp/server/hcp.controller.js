const path = require('path');
const _ = require('lodash');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { QueryTypes, Op } = require('sequelize');
const Hcp = require('./hcp_profile.model');
const HcpArchives = require(path.join(process.cwd(), 'src/modules/hcp/server/hcp_archives.model'));
const HcpConsents = require(path.join(process.cwd(), 'src/modules/hcp/server/hcp_consents.model'));
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));
const Consent = require(path.join(process.cwd(), 'src/modules/consent/server/consent.model'));
const ConsentLanguage = require(path.join(process.cwd(), 'src/modules/consent/server/consent_language.model'));
const Application = require(path.join(process.cwd(), 'src/modules/application/server/application.model'));
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const emailService = require(path.join(process.cwd(), 'src/config/server/lib/email-service/email.service'));
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

function generateAccessToken(doc) {
    return jwt.sign({
        id: doc.id,
        uuid: doc.uuid,
        email: doc.email
    }, nodecache.getValue('HCP_TOKEN_SECRET'), {
        expiresIn: '2d',
        issuer: doc.id.toString()
    });
}

function generateConsentConfirmationAccessToken(doc) {
    return jwt.sign({
        id: doc.id,
        uuid: doc.uuid,
        email: doc.email
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

function generateDefaultEmailOptions(user) {
    return {
        toAddresses: [user.email],
        data: {
            firstName: user.first_name || '',
            lastName: user.last_name || '',
        }
    };
}

async function sendConsentConfirmationMail(user, consents, application) {
    const consentConfirmationToken = generateConsentConfirmationAccessToken(user);
    const mailOptions = generateDefaultEmailOptions(user);

    mailOptions.templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/${application.slug}/double-opt-in-consent-confirm.html`);
    mailOptions.subject = 'Request consent confirmation';
    mailOptions.data.consents = consents || [];
    mailOptions.data.link = `${application.consent_confirmation_link}?token=${consentConfirmationToken}&journey=consent_confirmation&country_lang=${user.country_iso2}_${user.language_code}`;

    await emailService.send(mailOptions);
}

async function sendRegistrationSuccessMail(user, application) {
    const mailOptions = generateDefaultEmailOptions(user);

    mailOptions.subject = `You have successfully created a ${application.name} account.`;
    mailOptions.templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/${application.slug}/registration-success.html`);
    mailOptions.data.loginLink = `${application.login_link}?journey=login&country_lang=${user.country_iso2}_${user.language_code}`;

    await emailService.send(mailOptions);
}

async function sendResetPasswordSuccessMail(user, application) {
    const mailOptions = generateDefaultEmailOptions(user);

    mailOptions.subject = 'Your password has been reset.';
    mailOptions.templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/${application.slug}/password-reset-success.html`);

    await emailService.send(mailOptions);
}

async function sendPasswordSetupInstructionMail(user, application) {
    const mailOptions = generateDefaultEmailOptions(user);

    mailOptions.templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/${application.slug}/password-setup-instructions.html`);
    mailOptions.subject = `Set a password for your account on ${application.name}`;
    mailOptions.data.link = `${application.reset_password_link}?token=${user.reset_password_token}&journey=set_password&country_lang=${user.country_iso2}_${user.language_code}`;

    await emailService.send(mailOptions);
}

async function sendPasswordResetInstructionMail(user, application) {
    const mailOptions = generateDefaultEmailOptions(user);

    mailOptions.templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/${application.slug}/password-reset-instructions.html`);
    mailOptions.subject = `Reset the password for your account on ${application.name}`;
    mailOptions.data.link = `${application.reset_password_link}?token=${user.reset_password_token}&journey=set_password&country_lang=${user.country_iso2}_${user.language_code}`;

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
        const page = req.query.page ? req.query.page - 1 : 0;
        const limit = 15;
        const status = req.query.status === undefined ? null : req.query.status;
        const country_iso2 = req.query.country_iso2 === undefined ? null : req.query.country_iso2;
        const offset = page * limit;

        const application_list = (await Hcp.findAll()).map(i => i.get("application_id"));
        const country_iso2_list = req.user.type === 'admin' ? (await sequelize.datasyncConnector.query("SELECT * FROM ciam.vwcountry", { type: QueryTypes.SELECT })).map(i => i.country_iso2) : (await Hcp.findAll()).map(i => i.get("country_iso2"));
        const countries_ignorecase = [].concat.apply([], country_iso2_list.map(i => ignoreCaseArray(i)));
        const specialty_list = await sequelize.datasyncConnector.query("SELECT * FROM ciam.vwspecialtymaster", { type: QueryTypes.SELECT });


        const hcp_filter = {
            status: status === null ? { [Op.or]: ['approved', 'consent_pending', 'not_verified', null] } : status,
            application_id: req.user.type === 'admin' ? { [Op.or]: application_list } : req.user.application_id,
            country_iso2: country_iso2 ? { [Op.any]: ignoreCaseArray(country_iso2) } : req.user.type === 'admin' ? { [Op.any]: [countries_ignorecase] } : [].concat.apply([], req.user.countries.map(i => ignoreCaseArray(i)))
        };

        const hcps = await Hcp.findAll({
            where: hcp_filter,
            attributes: { exclude: ['password', 'created_by', 'updated_by'] },
            offset,
            limit,
            order: [
                ['created_at', 'DESC'],
                ['id', 'ASC']
            ]
        });

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
            country_iso2: country_iso2 ? country_iso2 : null,
            countries: req.user.type === 'admin' ? [...new Set(country_iso2_list)] : req.user.countries
        };

        response.data = data;
        res.json(response);
    } catch (err) {
        response.errors.push(new CustomError(err.message));
        res.status(500).send(response);
    }
}

async function editHcp(req, res) {
    const { first_name, last_name, telephone } = req.body;
    const response = new Response({}, []);

    try {
        const HcpUser = await Hcp.findOne({ where: { id: req.params.id } });

        if (!HcpUser) {
            response.errors.push(new CustomError('User not found'));
            return res.status(404).send(response);
        }

        HcpUser.update({ first_name, last_name, telephone });

        delete HcpUser.dataValues.password;
        delete HcpUser.dataValues.created_by;
        delete HcpUser.dataValues.updated_by;

        response.data = HcpUser;
        res.json(response);
    } catch (err) {
        response.errors.push(new CustomError(err.message));
        res.status(500).send(response);
    }
}

async function registrationLookup(req, res) {
    const { email, uuid } = req.body;

    const response = new Response({}, []);

    if (!email || !validator.isEmail(email)) {
        response.errors.push(new CustomError('Email address is missing or invalid.', 'email'));
    }

    if (!uuid) {
        response.errors.push(new CustomError('UUID is missing.', 'uuid'));
    }

    if (response.errors.length) {
        return res.status(400).send(response);
    }

    try {
        const profileByEmail = await Hcp.findOne({ where: { email } });
        const profileByUUID = await Hcp.findOne({ where: { uuid } });

        if (profileByEmail) {
            response.errors.push(new CustomError('Email address is already registered.', 'email'));
            return res.status(400).send(response);
        } else if (profileByUUID) {
            response.errors.push(new CustomError('UUID is already registered.', 'uuid'));
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
                response.errors.push(new CustomError('Invalid UUID.', 'uuid'));
                return res.status(400).send(response);
            }
        }

        res.json(response);
    } catch (err) {
        response.errors.push(new CustomError(err.message));
        res.status(500).send(response);
    }
}

async function createHcpProfile(req, res) {
    const response = new Response({}, []);
    const { email, uuid, salutation, first_name, last_name, country_iso2, language_code, specialty_onekey } = req.body;

    if (!email || !validator.isEmail(email)) {
        response.errors.push(new CustomError('Email address is missing or invalid.', 'email'));
    }

    if (!uuid) {
        response.errors.push(new CustomError('UUID is missing.', 'uuid'));
    }

    if (!salutation) {
        response.errors.push(new CustomError('Salutation is missing.', 'salutation'));
    }

    if (!first_name) {
        response.errors.push(new CustomError('First name is missing.', 'first_name'));
    }

    if (!last_name) {
        response.errors.push(new CustomError('Last name is missing.', 'last_name'));
    }

    if (!country_iso2) {
        response.errors.push(new CustomError('country_iso2 is missing.', 'country_iso2'));
    }

    if (!language_code) {
        response.errors.push(new CustomError('language_code is missing.', 'language_code'));
    }

    if (!specialty_onekey) {
        response.errors.push(new CustomError('specialty_onekey is missing.', 'specialty_onekey'));
    }

    if (response.errors.length) {
        return res.status(400).send(response);
    }

    try {
        const isEmailExists = await Hcp.findOne({ where: { email: req.body.email } });
        const isUUIDExists = await Hcp.findOne({ where: { uuid: req.body.uuid } });

        if (isEmailExists) {
            response.errors.push(new CustomError('Email already exists.', 'email'));
        }

        if (isUUIDExists) {
            response.errors.push(new CustomError('UUID already exists.', 'uuid'));
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
            email,
            uuid,
            salutation,
            first_name,
            last_name,
            country_iso2,
            language_code,
            specialty_onekey,
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

                const consentLang = await ConsentLanguage.findOne({
                    where: {
                        country_iso2: model.country_iso2,
                        language_code: model.language_code,
                        consent_id: consentDetails.id
                    }
                });

                if (!consentLang) return;


                if (consentDetails.opt_type === 'double') {
                    hasDoubleOptIn = true;
                }

                consentArr.push({
                    user_id: hcpUser.id,
                    consent_id: consentDetails.id,
                    title: consentLang.rich_text,
                    response: consentResponse,
                    consent_confirmed: consentDetails.opt_type === 'double' ? false : true,
                    created_by: req.user.id,
                    updated_by: req.user.id
                });
            }));

            consentArr.length && await HcpConsents.bulkCreate(consentArr, {
                returning: true,
                ignoreDuplicates: false
            });
        }

        hcpUser.status = master_data.individual_id_onekey ? hasDoubleOptIn ? 'consent_pending' : 'approved' : 'not_verified';
        await hcpUser.save();

        response.data = getHcpViewModel(hcpUser.dataValues);

        if (hcpUser.dataValues.status === 'consent_pending') {
            const unconfirmedConsents = consentArr.filter(consent => !consent.consent_confirmed);
            const consentTitles = unconfirmedConsents.map(consent => validator.unescape(consent.title));

            await sendConsentConfirmationMail(hcpUser.dataValues, consentTitles, req.user);
        }

        if (hcpUser.dataValues.status === 'approved') {
            await addPasswordResetTokenToUser(hcpUser);

            response.data.password_reset_token = hcpUser.dataValues.reset_password_token;
            response.data.retention_period = '1 hour';
        }

        res.json(response);
    } catch (err) {
        response.errors.push(new CustomError(err.message));
        res.status(500).send(response);
    }
}

async function confirmConsents(req, res) {
    const response = new Response({}, []);

    try {
        const payload = jwt.verify(req.body.token, nodecache.getValue('CONSENT_CONFIRMATION_TOKEN_SECRET'));
        const hcpUser = await Hcp.findOne({ where: { id: payload.id } });

        if (!hcpUser) {
            response.errors.push(new CustomError('Invalid token.'));
            return res.status(400).send(response);
        }

        let userConsents = await HcpConsents.findAll({ where: { user_id: payload.id } });

        if (userConsents && userConsents.length) {
            userConsents = userConsents.map(consent => ({ ...consent.dataValues, consent_confirmed: true }));

            await HcpConsents.bulkCreate(userConsents, {
                updateOnDuplicate: ['consent_confirmed']
            });
        }

        hcpUser.status = 'approved';
        await addPasswordResetTokenToUser(hcpUser);

        response.data = {
            ...getHcpViewModel(hcpUser.dataValues),
            password_reset_token: hcpUser.dataValues.reset_password_token,
            retention_period: '1 hour'
        };

        res.json(response);
    } catch (err) {
        response.errors.push(new CustomError(err.message));
        res.status(500).send(response);
    }
}

async function approveHCPUser(req, res) {
    const response = new Response({}, []);
    const id = req.params.id;

    try {
        const hcpUser = await Hcp.findOne({ where: { id } });

        if (!hcpUser) {
            response.errors.push(new CustomError('User does not exist.'));
            return res.status(404).send(response);
        }

        const userApplication = await Application.findOne({ where: { id: hcpUser.application_id } });

        let userConsents = await HcpConsents.findAll({ where: { [Op.and]: [{ user_id: id }, { consent_confirmed: false }] } });

        let hasDoubleOptIn = false;
        const consentTitles = [];

        if (userConsents && userConsents.length) {
            const consentIds = userConsents.map(consent => consent.consent_id)
            const allConsentDetails = await Consent.findAll({ where: { id: consentIds } });

            if (allConsentDetails && allConsentDetails.length) {
                hasDoubleOptIn = true;
                allConsentDetails.forEach(consent => consentTitles.push(validator.unescape(consent.rich_text)));
            }
        }

        hcpUser.status = hasDoubleOptIn ? 'consent_pending' : 'approved';
        await hcpUser.save();

        if (hcpUser.dataValues.status === 'consent_pending') {
            await sendConsentConfirmationMail(hcpUser, consentTitles, userApplication);
        }

        if (hcpUser.dataValues.status === 'approved') {
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
        response.errors.push(new CustomError(err.message));
        res.status(500).send(response);
    }
}

async function rejectHCPUser(req, res) {
    const response = new Response({}, []);
    const id = req.params.id;

    try {
        const hcpUser = await Hcp.findOne({ where: { id } });

        if (!hcpUser) {
            response.errors.push(new CustomError('User does not exist.'));
            return res.status(404).send(response);
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
        response.errors.push(new CustomError(err.message));
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
            response.errors.push(new CustomError('Profile not found.'));
            return res.status(404).send(response);
        }

        response.data = getHcpViewModel(doc.dataValues);
        res.json(response);
    } catch (err) {
        response.errors.push(new CustomError(err.message));
        res.status(500).send(response);
    }
}

async function changePassword(req, res) {
    const { email, current_password, new_password, confirm_password } = req.body;

    const response = new Response({}, []);

    if (!email || !current_password || !new_password || !confirm_password) {
        response.errors.push(new CustomError('Missing required parameters.'));
        return res.status(400).send(response);
    }

    try {
        const doc = await Hcp.findOne({ where: { email: email } });

        if (!doc || !doc.validPassword(current_password)) {
            response.errors.push(new CustomError('Invalid credentials.'));
            return res.status(401).send(response);
        }

        if (new_password !== confirm_password) {
            response.errors.push(new CustomError(`Password and confirm password doesn't match.`));
            return res.status(400).send(response);
        }

        doc.update({ password: new_password });

        const templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/${req.user.slug}/password-reset-success.html`);
        const options = {
            toAddresses: [email],
            templateUrl,
            subject: 'Your password has been changed.',
            data: {
                firstName: doc.first_name || '',
                lastName: doc.last_name || ''
            }
        };

        await emailService.send(options);

        response.data = 'Password changed successfully.';
        res.send(response);
    } catch (err) {
        response.errors.push(new CustomError(err.message));
        res.status(500).send(response);
    }
}

async function resetPassword(req, res) {
    const response = new Response({}, []);

    try {
        const doc = await Hcp.findOne({ where: { reset_password_token: req.query.token } });

        if (!doc) {
            response.errors.push(new CustomError('Invalid password reset token.'));
            return res.status(404).send(response);
        }

        if (doc.reset_password_expires < Date.now()) {
            response.errors.push(new CustomError('Password reset token has been expired. Please request again.'));
            return res.status(400).send(response);
        }

        if (req.body.new_password !== req.body.confirm_password) {
            response.errors.push(new CustomError(`Password and confirm password doesn't match.`));
            return res.status(400).send(response);
        }

        if (doc.password) {
            await sendResetPasswordSuccessMail(doc, req.user);
        } else {
            await sendRegistrationSuccessMail(doc, req.user);
        }

        await doc.update({ password: req.body.new_password, reset_password_token: null, reset_password_expires: null });

        response.data = 'Password reset successfully.';
        res.send(response);
    } catch (err) {
        response.errors.push(new CustomError(err.message));
        res.status(500).send(response);
    }
}

async function forgetPassword(req, res) {
    const response = new Response({}, []);
    try {
        const doc = await Hcp.findOne({ where: { email: req.query.email } });
        const userApplication = await Application.findOne({ where: { id: doc.application_id } });

        if (!doc) {
            response.errors.push(new CustomError(`Account doesn't exist`));
            return res.status(404).send(response);
        }

        await addPasswordResetTokenToUser(doc)

        await sendPasswordResetInstructionMail(doc, userApplication)

        response.data = 'Successfully sent password reset email.'

        res.json(response);
    } catch (err) {
        response.errors.push(new CustomError(err.message));
        res.status(500).send(response);
    }
}

async function getSpecialties(req, res) {
    const response = new Response([], []);
    try {
        const country = req.query.country;
        let locale = req.query.locale;

        if (!country) {
            response.errors.push(new CustomError(`Missing required query parameter`, 'country'));
            return res.status(400).send(response);
        }

        const masterDataSpecialties = await sequelize.datasyncConnector.query(`
            SELECT Country.codbase, countryname, cod_id_onekey, cod_locale, cod_description
            FROM ciam.vwcountry as Country
            INNER JOIN ciam.vwspecialtymaster as Specialty ON Country.codbase=Specialty.codbase
            WHERE LOWER(country_iso2) = $country_code AND LOWER(cod_locale) = $locale;
            `, {
            bind: {
                country_code: country.toLowerCase(),
                locale: locale ? locale.toLowerCase() : 'en'
            },
            type: QueryTypes.SELECT
        });

        if (!masterDataSpecialties || masterDataSpecialties.length === 0) {
            response.errors.push(new CustomError(`No specialties found for Country=${country}`));
            return res.status(404).send(response);
        }

        response.data = masterDataSpecialties;
        res.json(response);
    } catch (err) {
        response.errors.push(new CustomError(err.message));
        res.status(500).send(response);
    }
}

async function getAccessToken(req, res) {
    const response = new Response({}, []);

    try {
        const { email, password } = req.body;

        if (!email) {
            response.errors.push(new CustomError('Email is required.', 'email'));
        }

        if (!password) {
            response.errors.push(new CustomError('Password is required.', 'password'));
        }

        if (!email || !password) {
            return res.status(400).json(response);
        }

        const doc = await Hcp.findOne({ where: { email } });

        if (!doc || !doc.password || !doc.validPassword(password)) {
            response.errors.push(new CustomError('Invalid email or password.'));
            return res.status(401).json(response);
        }

        response.data = {
            ...getHcpViewModel(doc.dataValues),
            access_token: generateAccessToken(doc.dataValues),
            retention_period: '48 hours'
        }

        res.json(response);
    } catch (err) {
        response.errors.push(new CustomError(err.message));
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
