const async = require("async");

const userSeeder = function(callback) {
    const User = require("./modules/user/server/user.model");

    User.findOrCreate({where: {email: "system-admin@glpg-ciam.com"}, defaults: {
        name: "System Admin",
        password: "strong-password",
        type: "System Admin"
    }}).then(function() {
        callback();
    });
};

require("dotenv").config();

async.waterfall([userSeeder], function(err) {
    if (err) console.error(err);
    else console.info("DB seed completed!");
    process.exit();
});
