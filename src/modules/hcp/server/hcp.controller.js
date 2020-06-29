const Hcp = require('./hcp_profile.model');

async function getHcps(req, res) {
    const page = req.query.page - 1;
    const limit = 10;
    const is_active =
        req.query.is_active === 'null' ? null : req.query.is_active;
    const offset = page * limit;

    try {
        const hcps = await Hcp.findAll({
            where: {
                is_active: is_active === null ? [true, false] : is_active,
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
            is_active,
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

async function getHcpsById(req, res) {
    const { email, uuid } = req.body;

    try {
        const hcpUser = await Hcp.findOne({
            where: { email, uuid },
            attributes: { exclude: ['password'] },
        });

        if (!hcpUser) return res.status(404).send('HCP user not found');

        res.json(hcpUser);
    } catch (err) {
        res.status(500).send(err);
    }
}

async function resetHcpPassword(req, res) {
    const { email, uuid, password } = req.body;

    try {
        const hcpUser = await Hcp.findOne({
            where: { email, uuid },
        });

        if (!hcpUser) return res.status(404).send('HCP user not found');

        hcpUser.update({ password });

        res.status(200).send('password reset successfully');
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.getHcps = getHcps;
exports.editHcp = editHcp;
exports.resetHcpPassword = resetHcpPassword;
exports.getHcpsById = getHcpsById;
