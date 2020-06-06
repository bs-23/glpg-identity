const Hcp = require('./hcp.model');

async function getHcps(req, res) {
    try {
        const hcps = await Hcp.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json(hcps);
    } catch (error) {
        return res.status(500).send(error);
    }
}

async function editHcp(req, res) {
    const {
        name,
        email,
        phone
    } = req.body;

    try {
        const hcpUser = await Hcp.findOne({ where: { id: req.params.id }});

        if (!hcpUser) return res.sendStatus(404);

        hcpUser.update({ name, phone });

        res.json(hcpUser);
    }
    catch (err) {
        res.sendStatus(500);
    }
}

exports.getHcps = getHcps;
exports.editHcp = editHcp;
