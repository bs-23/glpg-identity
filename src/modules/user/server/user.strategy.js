const path = require('path');
const passport = require('passport');
const { Strategy } = require('passport-jwt');
const User = require('./user.model');
// const Userpermission = require(path.join(process.cwd(), "src/modules/user/server/user-permission.model"));
const Permission = require(path.join(process.cwd(), "src/modules/user/server/permission/permission.model"));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

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
        User.findOne({where: {id: payload.id}}).then(doc => {
            if(doc) {
                return done(null, doc);
            }

            return done(null, false);
        });
    }));
};
