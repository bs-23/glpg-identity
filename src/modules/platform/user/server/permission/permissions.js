const path = require('path');
const _ = require('lodash');
const Application = require(path.join(process.cwd(), 'src/modules/platform/application/server/application.model'));
const UserProfile = require(path.join(process.cwd(), "src/modules/platform/profile/server/user-profile.model.js"));
const UserProfile_PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/userProfile-permissionSet.model.js"));
const User_Role = require(path.join(process.cwd(), "src/modules/platform/role/server/user-role.model.js"));
const Role_PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/role-permissionSet.model.js"));
const Role = require(path.join(process.cwd(), "src/modules/platform/role/server/role.model.js"));
const PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permission-set.model.js"));
const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model.js'));
const PermissionSet_Service = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permissionset-service.model.js"));
const PermissionSet_Application = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permissionSet-application.model.js"));
const Service = require(path.join(process.cwd(), "src/modules/platform/user/server/permission/service.model.js"));

const getUserWithPermissionRelations = async (whereCondition) => {
    const user = await User.findOne({
        where: whereCondition,
        include: [{
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
                            model: PermissionSet_Service,
                            as: 'ps_sc',
                            include: [
                                {
                                    model: Service,
                                    as: 'service',
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
        },
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
                                model: PermissionSet_Service,
                                as: 'ps_sc',
                                include: [
                                    {
                                        model: Service,
                                        as: 'service',
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
        }
        ]
    });
    return user;
}

async function getProfileAndRolePermissions(user) {
    let applications = [];
    let countries = [];
    let service_categories = [];

    if (user.userProfile) {
        const profilePermissionSets = user.userProfile.up_ps;
        for (const userProPermSet of profilePermissionSets) {
            const [profile_applications, profile_countries, profile_serviceCategories] = await getPermissionsFromPermissionSet(userProPermSet.ps);
            applications = applications.concat(profile_applications);
            countries = countries.concat(profile_countries);
            service_categories = service_categories.concat(profile_serviceCategories);
        }
    }

    for (const userRole of user.userRoles) {
        for (const rolePermSet of userRole.role.role_ps) {
            const [role_applications, role_countries, role_serviceCategories] = await getPermissionsFromPermissionSet(rolePermSet.ps);
            applications = applications.concat(role_applications);
            countries = countries.concat(role_countries);
            service_categories = service_categories.concat(role_serviceCategories);
        }
    }

    const user_countries = [...new Set(countries)];
    const user_applications = _.uniqBy(applications, app => app.slug);
    const user_service_categories = _.uniqBy(service_categories, sc => sc.slug);

    return [user_applications, user_countries, user_service_categories];
}

async function getUserPermissions(userId) {
    const user = await getUserWithPermissionRelations({ id: userId });

    if(!user) return [[], [], []];

    const [user_applications, user_countries, user_service_categories] = await getProfileAndRolePermissions(user);

    return [user_applications, user_countries, user_service_categories];
}

async function getPermissionsFromPermissionSet(permissionSet) {
    let applications = [];
    let countries = [];
    let serviceCategories = [];

    if (permissionSet.ps_app) {
        for (const ps_app of permissionSet.ps_app) {
            const { id, name, slug, logo_link} = ps_app.application;

            const userApplication = { id, name, slug, logo_link };

            applications.push(userApplication);
        }
    }

    if(permissionSet.ps_sc){
        for (const ps_sc of permissionSet.ps_sc) {
            const userServiceCategory = ps_sc.service;

            serviceCategories.push(userServiceCategory);
        }
    }

    if (permissionSet.countries) {
        countries = permissionSet.countries;
    }


    return [applications, countries, serviceCategories];
}

async function getRequestingUserPermissions(user) {
    if(!user) return [[], [], []];

    const [user_applications, user_countries, user_service_categories] = await getProfileAndRolePermissions(user);

    return [user_applications, user_countries, user_service_categories];
}

exports.getUserPermissions = getUserPermissions;
exports.getRequestingUserPermissions = getRequestingUserPermissions;
exports.getPermissionsFromPermissionSet = getPermissionsFromPermissionSet;
exports.getUserWithPermissionRelations = getUserWithPermissionRelations;
