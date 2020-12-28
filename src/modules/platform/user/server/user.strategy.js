const path = require('path');
const passport = require('passport');
const { Strategy } = require('passport-jwt');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const { getUserWithPermissionRelations } = require(path.join(process.cwd(), "src/modules/platform/user/server/permission/permissions.js"));

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
        getUserWithPermissionRelations({ id: payload.id }).then(doc => {
            if (doc) {
                return done(null, doc);
            }

            return done(null, false);
        });
    }));
};
