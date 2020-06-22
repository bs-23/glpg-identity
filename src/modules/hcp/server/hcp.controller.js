const Hcp = require('./hcp.model');

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
            order: [['id', 'DESC']]
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

exports.getHcps = getHcps;
exports.editHcp = editHcp;
