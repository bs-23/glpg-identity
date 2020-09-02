const path = require("path");
const passport = require('passport');
const User = require(path.join(process.cwd(), "src/modules/user/server/user.model"));
const UserProfile = require(path.join(process.cwd(), "src/modules/user/server/user-profile.model"));
const UserProfile_PermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/userProfile-permissionSet.model"));
const PermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/permission-set.model"));
const PermissionSet_ServiceCateory = require(path.join(process.cwd(), "src/modules/user/server/permission-set/permissionSet-serviceCategory.model"));
const ServiceCategory = require(path.join(process.cwd(), "src/modules/user/server/permission/service-category.model"));
const UserPermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/user-permissionSet.model"));

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
        include: [{
            model: UserProfile,
            as: 'userProfile',
            include: [{
                model: UserProfile_PermissionSet,
                as: 'userProfile_permissionSet',
                include: [{
                    model: PermissionSet,
                    as: 'permissionSet',

                }]
            }]
        }]
    });

    return userWithPermissions;
}

async function getProfilePermissions(profile) {
    const serviceCategories = [];

    if (profile.userProfile_permissionSet) {
        for (const userProPermSet of profile.userProfile_permissionSet) {
            const permissionServiceCategories = await PermissionSet_ServiceCateory.findAll({
                where: {
                    permissionSetId: userProPermSet.permissionSet.id
                },
                include: [{
                    model: ServiceCategory,
                    as: 'serviceCategory'

                }]
            });
            permissionServiceCategories.forEach(perServiceCat => {
                serviceCategories.push(perServiceCat.serviceCategory);

            })
        }

        return serviceCategories;
    }
}

const ModuleGuard = (moduleName) => {
    return async function (req, res, next) {
        const user = await getUserWithProfiles(req.user.id);
        const userPermissions = await getProfilePermissions(user.userProfile);

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
