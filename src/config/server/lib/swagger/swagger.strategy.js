const path = require('path');
const passport = require('passport');
const { Strategy } = require('passport-jwt');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

module.exports = function () {
    function cookieExtractor(req) {
        let token;
        if (req && req.cookies) {
            token = req.cookies['swagger_access_token'];
        }
        return token;
    }

    passport.use('swagger-jwt', new Strategy({
        secretOrKey: nodecache.getValue('SWAGGER_TOKEN_SECRET'),
        jwtFromRequest: cookieExtractor
    }, function (payload, done) {
        const username = nodecache.getValue('SWAGGER_USERNAME')
        if(payload.username === username) {
            return done(null, payload);
        }
        return done(null, false, { message: 'Incorrect password.' });
    }));
};
