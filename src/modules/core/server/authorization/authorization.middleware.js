const path = require("path");
const passport = require('passport');
const logService = require(path.join(process.cwd(), "src/modules/core/server/audit/audit.service.js"));
const { getUserWithPermissionRelations } = require(path.join(process.cwd(), "src/modules/platform/user/server/permission/permissions.js"));

const AdminGuard = (req, res, next) => {
    if (!req.user) return res.status(401).send('unauthorized');
    if (req.user.type.toLowerCase() !== 'admin') return res.status(403).send('forbidden');

    next();
};

const AuthGuard = passport.authenticate('user-jwt', { session: false });

const isPermitted = (module, permissions) => {
    if (permissions.some(p => p.slug === module)) {
        return true;
    }
    return false;
};

async function getUserWithProfiles(id) {
    const userWithPermissions = await getUserWithPermissionRelations({ id });
    return userWithPermissions;
}

async function getProfilePermissions(profile) {
    const serviceCategories = [];
    if (profile) {
        for (const userProPermSet of profile.up_ps) {
            let permissionSet = userProPermSet.ps;
            for (const psc of permissionSet.ps_sc) {
                serviceCategories.push(psc.service);
            }

        }

        return serviceCategories;
    }
}

async function getRolePermissions(roles) {
    const serviceCategories = [];
    for (const userRole of roles) {
        for (const rolePermSet of userRole.role.role_ps) {
            let permissionSet = rolePermSet.ps;
            for (const psc of permissionSet.ps_sc) {
                serviceCategories.push(psc.service);
            }

        }

    }
    return serviceCategories;

}

const ModuleGuard = (moduleName) => {
    return async function (req, res, next) {
        const user = await getUserWithProfiles(req.user.id);
        const userPermissions = await getProfilePermissions(user.userProfile);
        const rolePermissions = await getRolePermissions(user.userRoles);
        let all_permissions = userPermissions.concat(rolePermissions);

        if (!isPermitted(moduleName, all_permissions)) {
            await logService.log({
                event_type: 'UNAUTHORIZE',
                actor: req.user.id
            });
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
