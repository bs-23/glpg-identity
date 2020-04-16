const async = require("async");
const User = require("./server/user/user.model");

const userSeeder = function(callback) {
    User.findOrCreate({where: {email: "admin@glpg-ciam.com"}, defaults: {
        name: "Super Admin",
        password: "strong-password",
        role: "super_admin"
    }}).then(function() {
        callback();
    });
};

//require("dotenv").config();

async.waterfall([userSeeder], function(err) {
    if (err) console.error(err);
    else console.info("DB seed completed!");
    process.exit();
});
