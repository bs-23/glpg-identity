const path = require('path');
const _ = require('lodash');
const Application = require(path.join(process.cwd(), 'src/modules/application/server/application.model'));
const UserProfile = require(path.join(process.cwd(), "src/modules/platform/profile/server/user-profile.model.js"));
const UserProfile_PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/userProfile-permissionSet.model.js"));
const User_Role = require(path.join(process.cwd(), "src/modules/platform/role/server/user-role.model.js"));
const Role_PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/role-permissionSet.model.js"));
const Role = require(path.join(process.cwd(), "src/modules/platform/role/server/role.model.js"));
const PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permission-set.model.js"));
const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model.js'));
const PermissionSet_ServiceCateory = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permissionSet-serviceCategory.model.js"));
const PermissionSet_Application = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permissionSet-application.model.js"));
const ServiceCategory = require(path.join(process.cwd(), "src/modules/platform/user/server/permission/service-category.model.js"));

async function getUserPermissions(userId) {
    let profile_applications = [];
    let profile_countries = [];
    let profile_service_categories = [];

    let role_applications = [];
    let role_countries = [];
    let role_service_categories = [];

    const user = await User.findOne({
        where: {
            id: userId
        },
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
        }
        ]
    });

    if (user.userProfile) {
        const profilePermissionSets = user.userProfile.up_ps;
        for (const userProPermSet of profilePermissionSets) {
            const [applications, countries, serviceCategories] = await getPermissionsFromPermissionSet(userProPermSet.ps);
            profile_applications = profile_applications.concat(applications);
            profile_countries = profile_countries.concat(countries);
            profile_service_categories = profile_service_categories.concat(serviceCategories);
        }
    }

    for (const userRole of user.userRoles) {
        for (const rolePermSet of userRole.role.role_ps) {
            const [applications, countries, serviceCategories] = await getPermissionsFromPermissionSet(rolePermSet.ps);
            role_applications = role_applications.concat(applications);
            role_countries = role_countries.concat(countries);
            role_service_categories = role_service_categories.concat(serviceCategories);
        }

    }

    const user_countries = [...new Set(role_countries.concat(profile_countries))];
    const user_applications = _.uniqBy(role_applications.concat(profile_applications), app => app.slug);
    const user_service_categories = _.uniqBy(role_service_categories.concat(profile_service_categories), sc => sc.slug);

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
            const userServiceCategory = ps_sc.serviceCategory;


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

    let role_applications = [];
    let role_countries = [];
    let role_service_categories = [];

    let profile_applications = [];
    let profile_countries = [];
    let profile_service_categories = [];

    if (user.userProfile) {
        const profilePermissionSets = user.userProfile.up_ps;
        for (const userProPermSet of profilePermissionSets) {
            const [applications, countries, serviceCategories] = await getPermissionsFromPermissionSet(userProPermSet.ps);
            profile_applications = profile_applications.concat(applications);
            profile_countries = profile_countries.concat(countries);
            profile_service_categories = profile_service_categories.concat(serviceCategories);
        }
    }

    for (const userRole of user.userRoles) {
        for (const rolePermSet of userRole.role.role_ps) {
            const [applications, countries, serviceCategories] = await getPermissionsFromPermissionSet(rolePermSet.ps);
            role_applications = role_applications.concat(applications);
            role_countries = role_countries.concat(countries);
            role_service_categories = role_service_categories.concat(serviceCategories);
        }
    }

    const user_countries = [...new Set(role_countries.concat(profile_countries))];
    const user_applications = _.uniqBy(role_applications.concat(profile_applications), app => app.slug);
    const user_service_categories = _.uniqBy(role_service_categories.concat(profile_service_categories), sc => sc.slug);

    return [user_applications, user_countries, user_service_categories];
}

exports.getUserPermissions = getUserPermissions;
exports.getRequestingUserPermissions = getRequestingUserPermissions;
exports.getPermissionsFromPermissionSet = getPermissionsFromPermissionSet;
