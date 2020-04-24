const passport = require("passport");
const controller = require("./user.controller");

module.exports = function(app) {
    app.route("/api/login").post(controller.login);

    app.route("/api/users")
        .post(passport.authenticate("user-jwt", { session: false }), controller.createUser);
};
