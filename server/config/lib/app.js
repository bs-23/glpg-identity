const path = require("path");
const passport = require("passport");

module.exports.start = function() {
    require("dotenv").config();
    require("./passport")(passport);

    const app = require("./express")();

    require(path.join(process.cwd(), "server/user/user.routes"))(app, passport);
    app.get("*", (req, res) => res.render("index"));

    app.listen(app.get("port"), function() {
        console.info("Server running on port %s in %s mode...", app.get("port"), app.settings.env);
    });
};
