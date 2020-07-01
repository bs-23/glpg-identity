const path = require('path');
const Hcp = require('./hcp_profile.model');
const { QueryTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const emailService = require(path.join(process.cwd(), 'src/config/server/lib/email-service/email.service'));

async function getHcps(req, res) {
    const page = req.query.page - 1;
    const limit = 10;
    let is_active = req.query.is_active === 'null' ? null : req.query.is_active;
    const offset = page * limit;

    try {
        const hcps = await Hcp.findAll({
            where: {
                is_active: (is_active) === null ? [true, false] : is_active
            },
            attributes: { exclude: ['password'] },
            offset: offset, limit: limit,
            order: [['created_at', 'ASC'], ['id', 'ASC']]
        });

        const totalUser = await Hcp.count();

        const data = {
            users: hcps,
            page: page + 1,
            limit: limit,
            total: totalUser,
            start: limit * page + 1,
            end: ((offset + limit) > totalUser) ? totalUser : (offset + limit),
            is_active: is_active
        }

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

    try {
        const hcp_master = await sequelize.datasyncConnector.query(`SELECT * FROM ciam.vwhcpmaster WHERE uuid_1 = ${uuid} OR uuid_2 = ${uuid} OR email_1 = ${email}`, { type: QueryTypes.SELECT });

        if (!hcp_master) return res.status(404).send('HCP profile not found!');

        res.json(hcp_master);

    } catch (err) {
        res.status(500).send(err);
    }
}

async function resetHcpPassword(req, res) {
    const { email, password, confirm_password } = req.body;

    try {
        const hcpUser = await Hcp.findOne({ where: { email: email } });

        if (!hcpUser) return res.status(404).send('HCP user not found.');

        if(password !== confirm_password) return res.status(400).send("Password and confirm password doesn't match.");

        hcpUser.update({ password });

        const templateUrl = path.join(
            process.cwd(),
            `src/config/server/lib/email-service/templates/hcp-password-reset.html`
        );
        const options = {
            toAddresses: [email],
            templateUrl,
            subject: 'Your password has been reset.',
            data: {
                firstName: hcpUser.first_name,
                lastName: hcpUser.last_name
            }
        }
        await emailService.send(options);

        res.status(200).send('Password reset successfully.');
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.getHcps = getHcps;
exports.editHcp = editHcp;
exports.resetHcpPassword = resetHcpPassword;
exports.checkHcpFromMaster = checkHcpFromMaster;
