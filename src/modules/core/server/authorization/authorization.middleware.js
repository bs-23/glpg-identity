const path = require("path");
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require(path.join(process.cwd(), "src/modules/platform/user/server/user.model.js"));
const UserProfile = require(path.join(process.cwd(), "src/modules/platform/profile/server/user-profile.model.js"));
const UserProfile_PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/userProfile-permissionSet.model.js"));
const PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permission-set.model.js"));
const PermissionSet_ServiceCateory = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permissionSet-serviceCategory.model.js"));
const ServiceCategory = require(path.join(process.cwd(), "src/modules/platform/user/server/permission/service-category.model.js"));
const PermissionSet_Application = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permissionSet-application.model.js"));
const Application = require(path.join(process.cwd(), "src/modules/platform/application/server/application.model"));
const User_Role = require(path.join(process.cwd(), "src/modules/platform/role/server/user-role.model.js"));
const Role_PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/role-permissionSet.model.js"));
const Role = require(path.join(process.cwd(), "src/modules/platform/role/server/role.model.js"));
const logService = require(path.join(process.cwd(), "src/modules/core/server/audit/audit.service.js"));

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
    const userWithPermissions = await User.findOne({
        where: { id },
        include: [
            {
                model: User_Role,
                as: 'userRoles',
                include: [{
                    model: Role,
                    as: 'role',
                    include: [{
                        model: Role_PermissionSet,
                        as: 'role_ps',
                        include: [{
                            model: PermissionSet,
                            as: 'ps',
                            include: [
                                {
                                    model: PermissionSet_ServiceCateory,
                                    as: 'ps_sc',
                                    include: [
                                        {
                                            model: ServiceCategory,
                                            as: 'serviceCategory',

                                        }
                                    ]

                                },
                                {
                                    model: PermissionSet_Application,
                                    as: 'ps_app',
                                    include: [
                                        {
                                            model: Application,
                                            as: 'application',

                                        }
                                    ]

                                }
                            ]

                        }]
                    }]

                }]
            },
            {

                model: UserProfile,
                as: 'userProfile',
                include: [{
                    model: UserProfile_PermissionSet,
                    as: 'up_ps',
                    include: [{
                        model: PermissionSet,
                        as: 'ps',
                        include: [
                            {
                                model: PermissionSet_ServiceCateory,
                                as: 'ps_sc',
                                include: [
                                    {
                                        model: ServiceCategory,
                                        as: 'serviceCategory',

                                    }
                                ]

                            },
                            {
                                model: PermissionSet_Application,
                                as: 'ps_app',
                                include: [
                                    {
                                        model: Application,
                                        as: 'application',

                                    }
                                ]

                            }
                        ]

                    }]
                }]
            }

        ]
    });

    return userWithPermissions;
}

async function getProfilePermissions(profile) {
    const serviceCategories = [];
    if (profile) {
        for (const userProPermSet of profile.up_ps) {
            let permissionSet = userProPermSet.ps;
            for (const psc of permissionSet.ps_sc) {
                serviceCategories.push(psc.serviceCategory);
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
                serviceCategories.push(psc.serviceCategory);
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
