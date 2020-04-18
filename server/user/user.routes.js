const jwt = require("jsonwebtoken");
const controller = require("./user.controller");

function generateAccessToken(user) {
    return jwt.sign({
        id: user.id,
        name: user.name,
        email: user.email
    }, process.env.TOKEN_SECRET,{
        expiresIn: "2d",
        issuer: user.id.toString()
    });
};

module.exports = function(app, passport) {
    app.route("/api/users")
        .post(passport.authenticate("user-jwt", { session: false }), controller.createUser);
};
