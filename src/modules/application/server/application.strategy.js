const path = require('path');
const passport = require('passport');
const { Strategy } = require('passport-jwt');
const Application = require('./application.model');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

module.exports = function() {
    function cookieExtractor(req) {
        let token = null;
        if (req && req.cookies) {
            token = req.cookies['access_token'];
        }
        return token;
    }

    passport.use('application-jwt', new Strategy({
        secretOrKey: nodecache.getValue('APPLICATION_TOKEN_SECRET'),
        jwtFromRequest: cookieExtractor
    }, function(payload, done) {
        Application.findOne({where: {id: payload.id}}).then(doc => {
            if(doc) {
                return done(null, doc);
            }

            return done(null, false);
        });
    }));
};
