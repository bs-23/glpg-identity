const path = require('path');
const passport = require('passport');
const { Strategy } = require('passport-jwt');
const User = require('./user.model');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const UserProfile = require(path.join(process.cwd(), "src/modules/user/server/user-profile.model"));
const UserProfile_PermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/userProfile-permissionSet.model"));
const PermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/permission-set.model"));
const User_Role = require(path.join(process.cwd(), "src/modules/user/server/role/user-role.model"));
const Role = require(path.join(process.cwd(), "src/modules/user/server/role/role.model"));
const Role_PermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/role-permissionSet.model"));


module.exports = function () {
    function cookieExtractor(req) {
        let token = null;
        if (req && req.cookies) {
            token = req.cookies['access_token'];
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
                                as: 'ps'

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
                            as: 'ps'

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
