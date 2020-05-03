const passport = require("passport");
const { Strategy } = require("passport-jwt");
const User = require("./user.model");

module.exports = function() {
    function cookieExtractor(req) {
        let token = null;
        if (req && req.cookies) {
            token = req.cookies["access_token"];
        }
        return token;
    }

    passport.use("user-jwt", new Strategy({
        secretOrKey: process.env.TOKEN_SECRET,
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