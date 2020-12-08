const path = require('path');
const passport = require('passport');
const { Strategy } = require('passport-jwt');
const User = require('./user.model');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const UserProfile = require(path.join(process.cwd(), "src/modules/platform/profile/server/user-profile.model"));
const UserProfile_PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/userProfile-permissionSet.model"));
const PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permission-set.model"));
const User_Role = require(path.join(process.cwd(), "src/modules/platform/role/server/user-role.model"));
const Role = require(path.join(process.cwd(), "src/modules/platform/role/server/role.model"));
const Role_PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/role-permissionSet.model"));
const PermissionSet_ServiceCateory = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permissionSet-serviceCategory.model"));
const PermissionSet_Application = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permissionSet-application.model"));
const Application = require(path.join(process.cwd(), "src/modules/application/server/application.model"));
const ServiceCategory = require(path.join(process.cwd(), "src/modules/platform/user/server/permission/service-category.model.js"));

module.exports = function () {
    function cookieExtractor(req) {
        let token = null;
        if (req && req.signedCookies) {
            token = req.signedCookies['access_token'];
        }
        return token;
    }

    passport.use('user-jwt', new Strategy({
        secretOrKey: nodecache.getValue('CDP_TOKEN_SECRET'),
        jwtFromRequest: cookieExtractor
    }, function (payload, done) {
        User.findOne({
            where: { id: payload.id },
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
        }).then(doc => {
            if (doc) {
                return done(null, doc);
            }

            return done(null, false);
        });
    }));
};
