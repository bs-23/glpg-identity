const path = require('path');
const Role = require('./role.model');
const RolePermissions = require('./role-permission.model');
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));

async function getRoles(req, res) {
    try {
        const roles = await Role.findAll();
        res.json(roles);
    } catch (err) {
        res.status(500).send(err);
    }
}

async function createRole(req, res) {
    const { name, description, permissions } = req.body;

    try {
        const doc = await Role.create({ name, description });

        permissions && permissions.forEach(async function (permissionId) {
            await RolePermissions.create({
                permissionId: permissionId,
                roleId: doc.id
            });
        });

        await logService.log({
            event_type: 'CREATE',
            object_id: doc.id,
            table_name: 'roles',
            created_by: req.user.id,
            description: `${doc.name} role created`
        });

        res.json(doc);
    } catch (err) {
        res.status(500).send(err);
    }
}

async function editRole(req, res) {
    const { name, description, permissions } = req.body;

    try {
        const doc = await Role.findOne({ where: { id: req.params.id } });

        if (!doc) {
            return res.sendStatus(400);
        }

        doc.update({ name, description});

        res.json(doc);
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.getRoles = getRoles;
exports.editRole = editRole;
exports.createRole = createRole;
