const path = require("path");
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require(path.join(process.cwd(), "src/modules/platform/user/server/user.model"));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const { generateAccessToken } = require(path.join(process.cwd(), "src/modules/platform/user/server/user.controller.js"));
const UserProfile = require(path.join(process.cwd(), "src/modules//platform/profile/server/user-profile.model"));
const UserProfile_PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/userProfile-permissionSet.model"));
const PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permission-set.model"));
const User_Role = require(path.join(process.cwd(), "src/modules/platform/role/server/user-role.model"));
const Role = require(path.join(process.cwd(), "src/modules/platform/role/server/role.model"));
const Role_PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/role-permissionSet.model"));
const PermissionSet_ServiceCateory = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permissionSet-serviceCategory.model"));
const PermissionSet_Application = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permissionSet-application.model"));
const Application = require(path.join(process.cwd(), "src/modules/platform/application/server/application.model"));
const ServiceCategory = require(path.join(process.cwd(), "src/modules/platform/user/server/permission/service-category.model.js"));

const CDPAuthStrategy = (req, res, next) => (
    passport.authenticate('user-jwt', async function(err, user) {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal server error');
        }

        if (!user) {
            try {
                const refreshTokenFromCookie = req.signedCookies['refresh_token'];

                if(!refreshTokenFromCookie) throw new Error();

                const payload = jwt.verify(refreshTokenFromCookie, nodecache.getValue('CDP_REFRESH_SECRET'));

                const userInstanceFromDB = await User.findOne({
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
                })

                if(!userInstanceFromDB) throw new Error();

                if(userInstanceFromDB.refresh_token !== refreshTokenFromCookie) throw new Error();

                const updatedAccessToken = generateAccessToken(userInstanceFromDB);

                req.logIn(userInstanceFromDB, { session: false }, function(error) {
                    if (error) { return next(error); }
                    res.cookie('access_token', updatedAccessToken, { httpOnly: true, sameSite: true, signed: true });
                    res.cookie('refresh_token', userInstanceFromDB.refresh_token, { httpOnly: true, sameSite: true, signed: true });
                    next();
                });
            } catch(error) {
                res.clearCookie('access_token');
                res.clearCookie('refresh_token');
                res.clearCookie('logged_in');
                return res.status(401).send('The refresh token is invalid or expired.');
            }
            return;
        }

        req.logIn(user, { session: false }, function (error) {
            if (error) { return next(error); }
            next();
        });
    })
)(req, res, next)

exports.CDPAuthStrategy = CDPAuthStrategy;
