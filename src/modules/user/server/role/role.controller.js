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
    const {
        name,
        description,
        permissions,
    } = req.body;

    try {
        const doc = await Role.create({
            name: name,
            description: description
        });

        permissions && permissions.forEach(async function (permissionId) {

            await RolePermissions.create({
                permissionId: permissionId,
                roleId: doc.id,
            });

        });
        const logData = {
            event_type: 'CREATE',
            object_id: doc.id,
            table_name: 'roles',
            created_by: req.user.id,
            description: 'Created new Role',
        }
        await logService.log(logData)

        res.json(doc);
    } catch (err) {
        res.status(500).send(err);
    }
}

async function editRole(req, res) {
    const { name, description, permissions } = req.body;
    const response = new Response({}, []);

    try {
        const role = await Role.findOne({ where: { id: req.params.id } });

        if (!role) {
            response.errors.push(new CustomError('Role not found'));
            return res.status(404).send(response);
        }

        role.update({ name, description});


        delete role.dataValues.created_by;
        delete role.dataValues.updated_by;

        response.data = role;
        res.json(response);
    } catch (err) {
        response.errors.push(new CustomError(err.message, '', '', err));
        res.status(500).send(response);
    }
}


exports.getRoles = getRoles;
exports.editRole = editRole;
exports.createRole = createRole;
