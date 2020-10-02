const path = require('path');
const passport = require('passport');
const { Strategy } = require('passport-jwt');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

module.exports = function () {
    function cookieExtractor(req) {
        let token = null;
        if (req && req.cookies) {
            token = req.cookies['access_token'];
        }
        return token;
    }

    passport.use('swagger-jwt', new Strategy({
        passReqToCallback: true,
        secretOrKey: nodecache.getValue('SWAGGER_TOKEN_SECRET'),
        jwtFromRequest: cookieExtractor
    }, function (payload, done) {
        return done(null, false, { message: 'Incorrect password.' });

    }));
};
