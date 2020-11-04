const path = require("path");
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require(path.join(process.cwd(), "src/modules/user/server/user.model"));
const Permission = require(path.join(process.cwd(), "src/modules/user/server/permission/permission.model"));
const UserRole = require(path.join(process.cwd(), "src/modules/user/server/user-role.model"));
const Role = require(path.join(process.cwd(), "src/modules/user/server/role/role.model"));
const RolePermission = require(path.join(process.cwd(), "src/modules/user/server/role/role-permission.model"));

const AdminGuard = (req, res, next) => {
    if (!req.user) return res.status(401).send('unauthorized');
    if (req.user.type.toLowerCase() !== 'admin') return res.status(403).send('forbidden');

    next();
};

const AuthGuard = passport.authenticate('user-jwt', { session: false });

const isPermitted = (module, permissions) => {
    if (permissions.some(p => p === module)) {
        return true;
    }
    return false;
};

async function getUserWithPermissions(id) {
    const userWithPermissions = await User.findOne({
        where: { id },
        include: [{
            model: UserRole,
            as: 'userrole',
            include: [{
                model: Role,
                as: 'role',
                include: [{
                    model: RolePermission,
                    as: 'rolePermission',
                    include: [{
                        model: Permission,
                        as: 'permission',
                    }]

                }]
            }]
        }]
    });

    return userWithPermissions;
}

function getPermissions(userrole) {
    const permissions = [];
    if (userrole) {
        userrole.forEach(ur => {
            permissions.push(ur.role.rolePermission.map(rp => rp.permission.module));
        })
        return permissions.flat(1);
    }
}

const ModuleGuard = (moduleName) => {
    return async function (req, res, next) {
        const user = await getUserWithPermissions(req.user.id);
        const userPermissions = getPermissions(user.userrole);

        if (!isPermitted(moduleName, userPermissions)) {
            return res
                .status(403)
                .send('Forbidden! You are not authorized to view this page');
        }
        next();
    }
};

const adminPipeline = [AuthGuard, AdminGuard];

exports.AdminGuard = AdminGuard;
exports.AuthGuard = AuthGuard;
exports.ModuleGuard = ModuleGuard;
exports.adminPipeline = adminPipeline;