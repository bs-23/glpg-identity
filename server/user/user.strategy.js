const {Strategy, ExtractJwt} = require("passport-jwt");
const User = require("./user.model");

module.exports = function(passport) {
    function cookieExtractor(req) {
        let token = null;
        if (req && req.cookies) {
            token = req.cookies["access_token"];
        }
        return token;
    }

    passport.use("user-jwt", new Strategy({
        secretOrKey: process.env.TOKEN_SECRET,
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor, ExtractJwt.fromAuthHeaderAsBearerToken()])
    }, function(payload, done) {
        User.findOne({where: {id: payload.id}}).then(user => {
            if(user) {
                return done(null, user);
            }

            return done(null, false);
        });
    }));
};
