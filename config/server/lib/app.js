const path = require("path");
const config = require("../config");

module.exports.start = async function() {
    require("dotenv").config();

    const sequelize = require("./sequelize");
    await sequelize.sync();

    const app = require("./express")();

    config.server.strategies.forEach(function (strategy) {
        require(path.resolve(strategy))();
    });

    app.listen(app.get("port"), function() {
        console.info("Server running on port %s in %s mode...", app.get("port"), app.settings.env);
    });
};
