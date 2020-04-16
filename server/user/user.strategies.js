const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const LocalStrategy = require("passport-local").Strategy;
const User = require("./user.model");

module.exports = function(passport) {
    function cookieExtractor(req) {
        let token = null;
        if (req && req.cookies) {
            token = req.cookies["access_token"];
        }
        return token;
    }

    passport.use("user-jwt", new JwtStrategy({
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

    passport.use("user-local", new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
        session: false
    }, function(req, email, password, done) {
        email = email.toLowerCase();

        process.nextTick(function() {
            User.findOrCreate({ email: email}, {name:  req.body.name, password: password}).then(([doc, created]) => {
                if(!created) {
                    return done(null, false, { message: "This email address already exists." });
                }

                done(null, doc);
            });
        });
    }));
};
