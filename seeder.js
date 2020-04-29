const path = require("path");
const async = require("async");

async function init() {
    require("dotenv").config();
    const sequelize = require(path.join(process.cwd(), "config/server/lib/sequelize"));
    await sequelize.query("CREATE SCHEMA IF NOT EXISTS ciam");
    const User = require(path.join(process.cwd(), "modules/user/server/user.model"));
    await sequelize.sync();

    function userSeeder(callback) {
        User.findOrCreate({where: {email: "system-admin@glpg-ciam.com"}, defaults: {
            name: "System Admin",
            password: "strong-password",
            type: "System Admin"
        }}).then(function() {
            callback();
        });
    }

    async.waterfall([userSeeder], function(err) {
        if(err) console.error(err);
        else console.info("DB seed completed!");
        process.exit();
    });
}

init();
