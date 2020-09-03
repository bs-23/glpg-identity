const path = require('path');
const Role = require('./role.model');
const RolePermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/role-permissionSet.model"));
const PermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/permission-set.model"));

async function getRoles(req, res) {
    try {
        const roles = await Role.findAll({
            include: [{
                model: RolePermissionSet,
                as: 'role_permissionSet',
                attributes: ['permissionSetId'],
                include: [{
                    model: PermissionSet,
                    as: 'permissionSet',
                    attributes: ['title']
                }]
            }],
            attributes: ['id', 'title', 'slug']
        });

        res.json(roles);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
}

async function createRole(req, res) {
    const { title, permissionSets } = req.body;

    try {
        if(!title) return res.status(400).send('Role title must not be empty.');
        if(!Array.isArray(permissionSets)) return res.status(400).send('Invalid format for permission sets.');
        if(!permissionSets.length) return res.status(400).send('Must provide permission sets.');

        const [role, created] = await Role.findOrCreate({
            where: { title },
            defaults: {
                title,
                slug: title.replace(/ /g, '_').toLowerCase(),
                created_by: req.user.id,
                updated_by: req.user.id
            }
        });

        if(!created) return res.status(400).send('role name already exists.');

        const permission_sets = permissionSets.map(id => ({ roleId: role.id, permissionSetId: id }));

        await RolePermissionSet.bulkCreate(permission_sets);

        res.json(role);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
}

exports.getRoles = getRoles;
exports.createRole = createRole;
