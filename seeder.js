const path = require("path");
const async = require("async");

async function init() {
    require("dotenv").config();
    const sequelize = require(path.join(process.cwd(), "src/config/server/lib/sequelize"));
    await sequelize.query("CREATE SCHEMA IF NOT EXISTS ciam");
    const Client = require(path.join(process.cwd(), "src/modules/core/server/client.model"));
    const User = require(path.join(process.cwd(), "src/modules/user/server/user.model"));
    await sequelize.sync();

    function clientSeeder(callback) {
        Client.findOrCreate({where: {email: "service.hcp@glpg-hcp.com"}, defaults: {
            name: "AEM HCP Portal Service User",
            password: "strong-password"
        }}).then(function() {
            callback();
        });
    }

    function userSeeder(callback) {
        User.findOrCreate({where: {email: "system-admin@glpg-ciam.com"}, defaults: {
            name: "System Admin",
            password: "strong-password",
            type: "System Admin"
        }}).then(function() {
            callback();
        });
    }

    async.waterfall([clientSeeder, userSeeder], function(err) {
        if(err) console.error(err);
        else console.info("DB seed completed!");
        process.exit();
    });
}

init();
