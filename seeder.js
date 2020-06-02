const path = require("path");
const async = require("async");

async function init() {
    require("dotenv").config();
    const sequelize = require(path.join(process.cwd(), "src/config/server/lib/sequelize"));
    await sequelize.query("CREATE SCHEMA IF NOT EXISTS ciam");
    const Client = require(path.join(process.cwd(), "src/modules/core/server/client.model"));
    const User = require(path.join(process.cwd(), "src/modules/user/server/user.model"));
    const Country = require(path.join(process.cwd(), "src/modules/core/server/country/country.model"));
    const Hcp_profiles = require(path.join(process.cwd(), "src/modules/hcp/server/hcp.model"));
    await sequelize.sync();

    function clientSeeder(callback) {
        Client.findOrCreate({
            where: { email: "service.hcp@glpg-hcp.com" }, defaults: {
                name: "AEM HCP Portal Service User",
                password: "strong-password"
            }
        }).then(function () {
            callback();
        });
    }

    function HcpSeeder(callback) {
        Hcp_profiles.findOrCreate({
            where: { email: "test@glpg-hcp.com" }, defaults: {
                name: "test",
                password: "test-password",
                application_id: "1b655255-91f6-453f-a169-71bee7a115a1"
            }
        }).then(function () {
            callback();
        });
    }


    function userSeeder(callback) {
        User.findOrCreate({
            where: { email: "system-admin@glpg-ciam.com" }, defaults: {
                name: "System Admin",
                password: "strong-password",
                type: "System Admin"
            }
        }).then(function () {
            callback();
        });
    }

    function countrySeeder(callback) {
        const countryList = [
            { "name": "United Kingdom" },
            { "name": "Netherland" },
            { "name": "Germany" },
            { "name": "Sweden" },
            { "name": "Norway" },
            { "name": "Italy" },
            { "name": "Poland" }
        ];

        Country.destroy({ truncate: true })
            .then(() => {
                Country.bulkCreate(countryList, {
                    returning: true,
                    ignoreDuplicates: false
                }).then(function () {
                    callback();
                });
            });


    }

    async.waterfall([clientSeeder, userSeeder, countrySeeder, HcpSeeder], function (err) {
        if (err) console.error(err);
        else console.info("DB seed completed!");
        process.exit();
    });
}

init();
