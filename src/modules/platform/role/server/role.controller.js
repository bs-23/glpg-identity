const path = require('path');
const { Op } = require('sequelize');
const Role = require('./role.model');
const RolePermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/role-permissionSet.model.js"));
const PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permission-set.model.js"));
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));

async function getRoles(req, res) {
    try {
        const roles = await Role.findAll({
            include: [{
                model: RolePermissionSet,
                as: 'role_ps',
                attributes: ['permissionset_id'],
            include: [{
                    model: PermissionSet,
                    as: 'ps',
                    attributes: ['title']
                }]
            }],
            attributes: ['id', 'title', 'slug', 'description']
        });

        res.json(roles);
    } catch (error) {
        logger.error(error);
        res.status(500).send('Internal server error');
    }
}

async function createRole(req, res) {
    const { title, description, permissionSets } = req.body;

    try {
        if(!title.trim()) return res.status(400).send('Role title must not be empty.');
        if(!Array.isArray(permissionSets)) return res.status(400).send('Invalid format for permission sets.');
        if(!permissionSets.length) return res.status(400).send('Must provide permission sets.');

        const [role, created] = await Role.findOrCreate({
            where: { title: { [Op.iLike]: title } },
            defaults: {
                title: title.trim(),
                slug: title.trim().replace(/ +/g, '_').toLowerCase(),
                description: (description || '').trim(),
                created_by: req.user.id,
                updated_by: req.user.id
            }
        });

        if(!created) return res.status(400).send('role name already exists.');

        const permission_sets = permissionSets.map(id => ({ role_id: role.id, permissionset_id: id }));

        await RolePermissionSet.bulkCreate(permission_sets);

        await logService.log({
            event_type: 'CREATE',
            object_id: role.id,
            table_name: 'roles',
            actor: req.user.id,
            remarks: `"${role.title}" role created`
        });

        res.json(role);
    } catch (error) {
        logger.error(error);
        res.status(500).send('Internal server error');
    }
}

async function editRole(req, res) {
    const { title, description, permissionSets } = req.body;
    const id = req.params.id;

    try {
        if(!title.trim()) return res.status(400).send('Profile title must not be empty.');
        if(!Array.isArray(permissionSets)) return res.status(400).send('Invalid format for permission sets.');
        if(!permissionSets.length) return res.status(400).send('Must provide permission sets.');

        const foundRole = await Role.findOne({ where: { id } });

        if(!foundRole) return res.status(400).send('Role not found.');

        const roleWithSameName = await Role.findOne({ where: {
            title: { [Op.iLike]: title },
            id: { [Op.ne]: id } }
        });

        if(roleWithSameName) return res.status(400).send('Role with the same title already exists.');

        await foundRole.update({
            title: title.trim(),
            slug: title.trim().replace(/ +/g, '_').toLowerCase(),
            description: (description || '').trim(),
            updated_by: req.user.id
        });

        await foundRole.setPermission_sets(permissionSets);

        await logService.log({
            event_type: 'UPDATE',
            object_id: foundRole.id,
            table_name: 'roles',
            actor: req.user.id,
            remarks: `Role updated`
        });

        res.json(foundRole);
    } catch (error) {
        logger.error(error);
        res.status(500).send('Internal server error');
    }
}

exports.getRoles = getRoles;
exports.createRole = createRole;
exports.editRole = editRole;
