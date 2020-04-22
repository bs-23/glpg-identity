const path = require("path");
const passport = require("passport");

module.exports.start = async function() {
    require("dotenv").config();
    require("./passport")(passport);
    const sequelize = require("./sequelize");

    const app = require("./express")();

    await sequelize.sync({alter: true});

    require(path.join(process.cwd(), "server/user/user.routes"))(app, passport);
    require(path.join(process.cwd(), "server/core/core.routes"))(app);

    app.listen(app.get("port"), function() {
        console.info("Server running on port %s in %s mode...", app.get("port"), app.settings.env);
    });
};
