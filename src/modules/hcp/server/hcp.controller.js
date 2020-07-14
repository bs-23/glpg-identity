const path = require('path');
const _ = require('lodash');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { QueryTypes } = require('sequelize');
const Hcp = require('./hcp_profile.model');
const HcpConsents = require('./hcp_consents.model');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const emailService = require(path.join(process.cwd(), 'src/config/server/lib/email-service/email.service'));
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

function generateAccessToken(doc) {
    return jwt.sign({
        id: doc.id,
        uuid: doc.uuid,
        email: doc.email,
    }, nodecache.getValue('HCP_TOKEN_SECRET'), {
        expiresIn: '2d',
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

async function getHcps(req, res) {
    const response = new Response({}, []);

    try {
        const page = req.query.page - 1;
        const limit = 10;
        const status = req.query.is_active === 'null' ? null : req.query.is_active;
        const offset = page * limit;

        const hcps = await Hcp.findAll({
            where: {
                status: !status ? ['Approved', 'Pending', 'Rejected'] : status,
            },
            attributes: { exclude: ['password', 'created_by', 'updated_by'] },
            offset,
            limit,
            order: [
                ['created_at', 'ASC'],
                ['id', 'ASC']
            ]
        });

        const totalUser = await Hcp.count();

        const data = {
            users: hcps,
            page: page + 1,
            limit,
            total: totalUser,
            start: limit * page + 1,
            end: offset + limit > totalUser ? totalUser : offset + limit,
            status
        };

        response.data = data;
        res.json(response);
    } catch (err) {
        response.errors.push(new CustomError(err.message, '', '', err));
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
        response.errors.push(new CustomError(err.message, '', '', err));
        res.status(500).send(response);
    }
}

async function registrationLookup(req, res) {
    const { email, uuid } = req.body;

    const response = new Response({}, []);

    if (!email) {
        response.errors.push(new CustomError('Email address is missing.', 'email'));
    }

    if (!uuid) {
        response.errors.push(new CustomError('UUID is missing.', 'uuid'));
    }

    if (!uuid || !email) {
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
        response.errors.push(new CustomError(err.message, '', '', err));
        res.status(500).send(response);
    }
}

async function createHcpProfile(req, res) {
    const response = new Response({}, []);

    try {
        const isEmailExists =  await Hcp.findOne({ where: { email: req.body.email }});
        const isUUIDExists =  await Hcp.findOne({ where: { uuid: req.body.uuid }});

        if (isEmailExists) {
            response.errors.push(new CustomError('Email already exists.', 'email'));
        }

        if (isUUIDExists) {
            response.errors.push(new CustomError('UUID already exists.', 'uuid'));
        }

        if (isEmailExists || isUUIDExists) {
            return res.status(400).send(response);
        }

        let master_data = null;

        if(req.body.uuid) {
            master_data = await sequelize.datasyncConnector.query('SELECT * FROM ciam.vwhcpmaster WHERE uuid_1 = $uuid OR uuid_2 = $uuid', {
                bind: { uuid: req.body.uuid },
                type: QueryTypes.SELECT
            });
        }

        const doc = await Hcp.create({
            email: req.body.email,
            uuid: req.body.uuid,
            salutation: req.body.salutation,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            country_iso2: req.body.country_iso2,
            specialty_onekey: req.body.specialty_onekey,
            application_id: req.user.id,
            created_by: req.user.id,
            updated_by: req.user.id,
            status: master_data && master_data.length ? 'Approved' : 'Pending',
            reset_password_token: crypto.randomBytes(36).toString('hex'),
            reset_password_expires: Date.now() + 3600000
        });

        if (req.body.consents) {
            const consentArr = [];
            req.body.consents.forEach(element => {
                consentArr.push({
                    user_id: doc.id,
                    consent_id: Object.keys(element)[0],
                    response: Object.values(element)[0]
                });
            });

            await HcpConsents.bulkCreate(consentArr, {
                returning: true,
                ignoreDuplicates: false
            });
        }

        response.data = {
            ...getHcpViewModel(doc.dataValues),
            password_reset_token: doc.dataValues.reset_password_token,
            retention_period: '1 hour'
        };

        res.json(response);
    } catch (err) {
        response.errors.push(new CustomError(err.message, '', '', err));
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
        response.errors.push(new CustomError(err.message, '', '', err));
        res.status(500).send(response);
    }
}

async function changePassword(req, res) {
    const { email, current_password, new_password, confirm_password } = req.body;

    if (!email || !current_password || !new_password || !confirm_password) {
        response.errors.push(new CustomError('Missing required parameters.'));
        return res.status(400).send(response);
    }

    const response = new Response({}, []);
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

        const templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/hcp-password-reset.html`);
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
        response.errors.push(new CustomError(err.message, '', '', err));
        res.status(500).send(response);
    }
}

async function resetPassword(req, res) {
    const response = new Response({}, []);
    try {
        const doc = await Hcp.findOne({ where: { reset_password_token: req.query.token } });

        if(!doc) {
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

        doc.update({ password: req.body.new_password });

        const templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/hcp-password-reset.html`);
        const options = {
            toAddresses: [doc.email],
            templateUrl,
            subject: 'Your password has been changed.',
            data: {
                firstName: doc.first_name || '',
                lastName: doc.last_name || ''
            }
        };

        await emailService.send(options);

        response.data = 'Password reset successfully.';
        res.send(response);
    } catch(err) {
        response.errors.push(new CustomError(err.message, '', '', err));
        res.status(500).send(response);
    }
}

async function forgetPassword(req, res) {
    const response = new Response({}, []);
    try {
        const doc = await Hcp.findOne({ where: { email: req.query.email } });

        if(!doc) {
            response.errors.push(new CustomError(`Account doesn't exist`));
            return res.status(404).send(response);
        }

        const randomToken = crypto.randomBytes(36).toString('hex');

        doc.update({
            reset_password_token: randomToken,
            reset_password_expires: Date.now() + 3600000
        });

        response.data = {
            password_reset_token: randomToken,
            retention_period: '1 hour'
        };
        res.json(response);
    } catch(err) {
        response.errors.push(new CustomError(err.message, '', '', err));
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
            WHERE LOWER(country_iso2) = $country_code AND cod_locale = $locale;
            `, {
            bind: {
                country_code: country.toLowerCase(),
                locale: locale || 'en'
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
        response.errors.push(new CustomError(err.message, '', '', err));
        res.status(500).send(response);
    }
}

async function getAccessToken(req, res) {
    const response = new Response({}, []);

    try {
        const { email, password } = req.body;

        if(!email) {
            response.errors.push(new CustomError('Email is required.', 'email'));
            response.errors.push({
                field: 'email',
                message: 'Email is required.'
            });
        }

        if(!password) {
            response.errors.push(new CustomError('Password is required.', 'password'));
        }

        if (!email || !password) {
            return res.status(400).json(response);
        }

        const doc = await Hcp.findOne({ where: { email } });

        if (!doc || !doc.validPassword(password)) {
            response.errors.push(new CustomError('Invalid email or password.'));
            return res.status(401).json(response);
        }

        response.data = {
            uuid: doc.uuid,
            email: doc.email,
            access_token: generateAccessToken(doc),
            retention_period: '48 hours'
        }

        res.json(response);
    } catch (err) {
        response.errors.push(new CustomError(err.message, '', '', err));
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
