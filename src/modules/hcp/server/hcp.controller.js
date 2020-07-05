const path = require('path');
const _ = require('lodash');
const crypto = require('crypto');
const { QueryTypes } = require('sequelize');
const Hcp = require('./hcp_profile.model');
const HcpConsents = require('./hcp_consents.model');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const emailService = require(path.join(process.cwd(), 'src/config/server/lib/email-service/email.service'));

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

async function getHcps(req, res) {
    try {
        const page = req.query.page - 1;
        const limit = 10;
        const status = req.query.is_active === 'null' ? null : req.query.is_active;
        const offset = page * limit;

        const hcps = await Hcp.findAll({
            where: {
                status: !status ? ['Approved', 'Not Approved', 'In Progress', 'Rejected'] : status,
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

        res.json(data);
    } catch (err) {
        res.status(500).send(err);
    }
}

async function editHcp(req, res) {
    const { first_name, last_name, phone } = req.body;

    try {
        const HcpUser = await Hcp.findOne({ where: { id: req.params.id } });

        if (!HcpUser) return res.sendStatus(404);

        HcpUser.update({ first_name, last_name, phone });

        delete HcpUser.dataValues.password;
        delete HcpUser.dataValues.created_by;
        delete HcpUser.dataValues.updated_by;

        res.json(HcpUser);
    } catch (err) {
        res.status(500).send(err);
    }
}

async function checkHcpDetails(req, res) {
    const { email, uuid } = req.body;

    if (!uuid || !email) return res.status(400).send('Missing required parameters.');

    try {
        const master_data = await sequelize.datasyncConnector.query('SELECT * FROM ciam.vwhcpmaster WHERE uuid_1 = $uuid OR uuid_2 = $uuid', {
            bind: { uuid },
            type: QueryTypes.SELECT
        });

        if(!master_data || !master_data.length) {
            return res.status(404).send('Invalid UUID.');
        }

        const profile = await Hcp.findOne({
            where: { email, uuid },
            attributes: { exclude: ['password', 'created_at', 'updated_at', 'created_by', 'updated_by', 'reset_password_token', 'reset_password_expires', 'application_id'] }
        });

        if (!profile) return res.status(404).send('HCP profile not found.');

        res.json(getHcpViewModel(profile.dataValues));
    } catch (err) {
        res.status(500).send(err);
    }
}

async function createHcpProfile(req, res) {
    try {
        let master_data = null;

        if(req.body.uuid) {
            master_data = await sequelize.datasyncConnector.query('SELECT * FROM ciam.vwhcpmaster WHERE uuid_1 = $uuid OR uuid_2 = $uuid', {
                bind: { uuid: req.body.uuid },
                type: QueryTypes.SELECT
            });
        }

        const [doc, created] = await Hcp.findOrCreate({
            where: { email: req.body.email },
            defaults: {
                salutation: req.body.salutation,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                uuid: req.body.uuid,
                country_code: req.body.country_code,
                speciality_onekey: req.body.speciality_onekey,
                application_id: req.user.id,
                created_by: req.user.id,
                updated_by: req.user.id,
                status: master_data && master_data.length ? 'Approved' : 'Pending',
                reset_password_token: crypto.randomBytes(36).toString('hex'),
                reset_password_expires: Date.now() + 3600000
            }
        });

        if (!created) {
            return res.status(400).send('Email or UUID already exists.');
        }

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

        res.json({
            ...getHcpViewModel(doc.dataValues),
            password_reset_token: doc.dataValues.reset_password_token,
            retention_period: '1 hour'
        });
    } catch (err) {
        res.status(500).send(err);
    }
}

async function getHcpProfile(req, res) {
    try {
        const doc = await Hcp.findOne({
            where: { id: req.params.id },
            attributes: { exclude: ['password', 'created_at', 'updated_at', 'created_by', 'updated_by', 'reset_password_token', 'reset_password_expires', 'application_id'] }
        });

        if (!doc) return res.status(404).send('Profile not found.');

        res.json(getHcpViewModel(doc.dataValues));
    } catch (err) {
        res.status(500).send(err);
    }
}

async function changePassword(req, res) {
    const { email, new_password, confirm_password } = req.body;

    if (!email || !new_password || !confirm_password) return res.status(400).send('Missing required parameters.');

    try {
        const doc = await Hcp.findOne({ where: { email: email } });

        if (!doc) return res.status(404).send('Profile not found.');

        if (new_password !== confirm_password) {
            return res.status(400).send("Password and confirm password doesn't match.");
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

        res.send('Password changed successfully.');
    } catch (err) {
        res.status(500).send(err);
    }
}

async function resetPassword(req, res) {
    try {
        const doc = await Hcp.findOne({ where: { reset_password_token: req.query.token } });

        if(!doc) return res.status(404).send("Invalid password reset token.");

        if(doc.reset_password_expires < Date.now()) return res.status(400).send("Password reset token has been expired. Please request again.");

        if(req.body.new_password !== req.body.confirm_password) return res.status(400).send("Password and confirm password doesn't match.");

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

        res.send('Password reset successfully.');
    } catch(err) {
        res.status(500).send(err);
    }
}

async function forgetPassword(req, res) {
    try {
        const doc = await Hcp.findOne({ where: { email: req.query.email } });

        if(!doc) return res.status(404).send("Account doesn't exist");

        const randomToken = crypto.randomBytes(36).toString('hex');

        doc.update({
            reset_password_token: randomToken,
            reset_password_expires: Date.now() + 3600000
        });

        res.json({
            password_reset_token: randomToken,
            retention_period: '1 hour'
        });
    } catch(err) {
        res.status(500).send(err);
    }
}

exports.getHcps = getHcps;
exports.editHcp = editHcp;
exports.checkHcpDetails = checkHcpDetails;
exports.createHcpProfile = createHcpProfile;
exports.getHcpProfile = getHcpProfile;
exports.changePassword = changePassword;
exports.resetPassword = resetPassword;
exports.forgetPassword = forgetPassword;
