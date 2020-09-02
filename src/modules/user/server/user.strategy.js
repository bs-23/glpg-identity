const path = require('path');
const passport = require('passport');
const { Strategy } = require('passport-jwt');
const User = require('./user.model');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const UserProfile = require(path.join(process.cwd(), "src/modules/user/server/user-profile.model"));
const UserProfile_PermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/userProfile-permissionSet.model"));
const PermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/permission-set.model"));
const UserPermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/user-permissionSet.model"));

module.exports = function() {
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
    }, function(payload, done) {
        User.findOne({where: {id: payload.id},
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
            },
            {
                model: UserPermissionSet,
                as: 'user_permissionSet',
                include: [{
                    model: PermissionSet,
                    as: 'permissionSet',

                }]

            }
            ]
        }).then(doc => {
            if(doc) {
                return done(null, doc);
            }

            return done(null, false);
        });
    }));
};
