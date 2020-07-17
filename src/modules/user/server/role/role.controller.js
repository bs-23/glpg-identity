const path = require('path');
const Role = require('./role.model');
const RolePermissions = require('./role-permission.model');
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));
const RolePermission = require(path.join(process.cwd(), "src/modules/user/server/role/role-permission.model"));


const convertToSlug = string => string.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-");

async function getRoles(req, res) {
    try {
        const roles = await Role.findAll({
            include: [{
                model: RolePermissions,
                as: 'rolePermission'
            }],
            order: [
                ['created_at', 'ASC'],
                ['id', 'ASC']
            ]
        });
        res.json(roles);
    } catch (err) {
        res.status(500).send(err);
    }
}

async function createRole(req, res) {
    try {
        const doc = await Role.create({
            name: req.body.name,
            description: req.body.description,
            slug: convertToSlug(req.body.name),
            created_by: req.user.id,
            updated_by: req.user.id
        });

        req.body.permissions && req.body.permissions.forEach(async function (permissionId) {
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
        const doc = await Role.findOne({ where: { id: req.params.id },
            include: [{
                model: RolePermission,
                as: 'rolePermission'
            }]
         });

        if (!doc) {
            return res.sendStatus(400);
        }

        await doc.update({ name, description, slug: convertToSlug(name), updated_by: req.user.id });

        doc.rolePermission.forEach(async rp => {
            await rp.destroy();

        });

        permissions && permissions.forEach(async function (permissionId) {
            await RolePermissions.create({
                permissionId: permissionId,
                roleId: doc.id
            });
        });

        res.json(doc);
    } catch (err) {
         res.status(500).send(err);
    }
}

exports.getRoles = getRoles;
exports.editRole = editRole;
exports.createRole = createRole;
