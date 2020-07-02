const path = require('path');
const validator = require('validator');
const { QueryTypes } = require('sequelize');
const Hcp = require('./hcp_profile.model');
const HcpConsents = require('./hcp_consents.model');
const { version } = require('punycode');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const emailService = require(path.join(process.cwd(), 'src/config/server/lib/email-service/email.service'));

async function getHcps(req, res) {


    try {
        const page = req.query.page - 1;
        const limit = 10;
        const status =
            req.query.is_active === 'null' ? null : req.query.is_active;
        const offset = page * limit;

        const hcps = await Hcp.findAll({
            where: {
                status: !status ? ['Approved', 'Not Approved', 'In Progress', 'Rejected'] : status,
            },
            attributes: { exclude: ['password'] },
            offset,
            limit,
            order: [
                ['created_at', 'ASC'],
                ['id', 'ASC'],
            ],
        });

        const totalUser = await Hcp.count();

        const data = {
            users: hcps,
            page: page + 1,
            limit,
            total: totalUser,
            start: limit * page + 1,
            end: offset + limit > totalUser ? totalUser : offset + limit,
            status,
        };

        res.json(data);
    } catch (err) {
        res.status(500).send(err);
    }
}

async function editHcp(req, res) {
    const { first_name, last_name, phone } = req.body;

    try {
        const hcpUser = await Hcp.findOne({ where: { id: req.params.id } });

        if (!hcpUser) return res.sendStatus(404);

        hcpUser.update({ first_name, last_name, phone });

        res.json(hcpUser);
    } catch (err) {
        res.status(500).send(err);
    }
}

async function checkHcpFromMaster(req, res) {
    const { email, uuid } = req.body;

    if (!uuid || !email) return res.status(400).send('Missing required parameters.');

    try {
        const data = await sequelize.datasyncConnector.query(
            'SELECT * FROM ciam.vwhcpmaster WHERE uuid_1 = $uuid OR uuid_2 = $uuid OR email_1 = $email', {
            limit: 1,
            bind: { uuid, email },
            type: QueryTypes.SELECT
        }
        );

        if (!data || !data.length) return res.status(404).send('HCP profile not found!');

        res.json(data[0]);
    } catch (err) {
        res.status(500).send(err);
    }
}

async function resetHcpPassword(req, res) {
    const { email, password, confirm_password } = req.body;

    try {
        if (!validator.isUUID(req.params.id, 'all')) {
            return res.status(400).send("Invalid id");
        }

        const hcpUser = await Hcp.findOne({ where: { id: req.params.id, email: email } });

        if (!hcpUser) return res.status(404).send('HCP user not found.');

        if (password !== confirm_password) {
            return res.status(400).send("Password and confirm password doesn't match.");
        }

        hcpUser.update({ password });

        const templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/hcp-password-reset.html`);
        const options = {
            toAddresses: [email],
            templateUrl,
            subject: 'Your password has been reset.',
            data: {
                firstName: hcpUser.first_name,
                lastName: hcpUser.last_name
            }
        };

        await emailService.send(options);

        res.send('Password reset successfully.');
    } catch (err) {
        res.status(500).send(err);
    }
}

async function createHcpProfile(req, res) {
    const {
        first_name,
        last_name,
        uuid,
        email,
        password,
        phone,
        country_iso2,
        status,
        consents,
    } = req.body;

    const application_id = req.user.id;

    try {
        const [doc, created] = await Hcp.findOrCreate({
            where: { email },
            defaults: {
                first_name,
                last_name,
                uuid,
                password,
                phone,
                country_iso2,
                status,
                application_id,
            }
        });

        if (!created) {
            return res.sendStatus(400);
        }

        delete doc.dataValues.password;
        delete doc.dataValues.created_by;
        delete doc.dataValues.updated_by;


        if (consents) {
            const consentArr = [];
            consents.forEach(element => {
                consentArr.push({
                    user_id: doc.id,
                    consent_id: Object.keys(element)[0],
                    response: Object.values(element)[0],
                });
            });

            await HcpConsents.bulkCreate(consentArr, {
                returning: true,
                ignoreDuplicates: false
            });

        }

        res.json(doc);
    } catch (err) {
        res.status(500).send(err);
    }
}

async function getHcpProfile(req, res) {
    try {
        const hcpProfile = await Hcp.findOne({
            where: { id: req.params.id },
            attributes: { exclude: ['password'] },
        });

        if (!hcpProfile) return res.status(404).send('HCP profile not found!');

        res.json(hcpProfile);
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.getHcps = getHcps;
exports.editHcp = editHcp;
exports.resetHcpPassword = resetHcpPassword;
exports.checkHcpFromMaster = checkHcpFromMaster;
exports.createHcpProfile = createHcpProfile;
exports.getHcpProfile = getHcpProfile;
