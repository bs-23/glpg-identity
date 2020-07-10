const Permission = require('./permission.model');

async function getPermissions(req, res) {
    try {
        const permissions = await Permission.findAll({ where: { status: 'active' }});

        res.json(permissions);
    } catch(err) {
        res.status(500).send(err);
    }
}

exports.getPermissions = getPermissions;
