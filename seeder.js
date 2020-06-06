const path = require("path");
const async = require("async");

async function init() {
    require("dotenv").config();

    const sequelize = require(path.join(process.cwd(), "src/config/server/lib/sequelize"));
    await sequelize.query("CREATE SCHEMA IF NOT EXISTS ciam");

    const Client = require(path.join(process.cwd(), "src/modules/core/server/client.model"));
    const User = require(path.join(process.cwd(), "src/modules/user/server/user.model"));
    const Country = require(path.join(process.cwd(), "src/modules/core/server/country/country.model"));
    const HCP = require(path.join(process.cwd(), "src/modules/hcp/server/hcp.model"));

    await sequelize.sync();

    function clientSeeder(callback) {
        Client.findOrCreate({
            where: { email: "service.hcp@glpg-hcp.com" }, defaults: {
                name: "AEM HCP Portal Service User",
                password: "strong-password"
            }
        }).then(function() {
            callback();
        });
    }

    function userSeeder(callback) {
        User.findOrCreate({
            where: { email: "system-admin@glpg-ciam.com" }, defaults: {
                name: "System Admin",
                password: "strong-password",
                type: "system_admin"
            }
        }).then(function() {
            callback();
        });
    }

    function countriesSeeder(callback) {
        const countries = [
            { "name": "Belgium", "country_iso2": "BE", "country_iso3": "BEL", "codebase": "WBE" },
            { "name": "France", "country_iso2": "FR", "country_iso3": "FRA", "codebase": "WFR" },
            { "name": "Germany", "country_iso2": "DE", "country_iso3": "DEU", "codebase": "WDE" },
            { "name": "Italy", "country_iso2": "IT", "country_iso3": "ITA", "codebase": "WIT" },
            { "name": "Netherlands", "country_iso2": "NL", "country_iso3": "NLD", "codebase": "WNL" },
            { "name": "Spain", "country_iso2": "ES", "country_iso3": "ESP", "codebase": "WES" },
            { "name": "United Kingdom", "country_iso2": "GB", "country_iso3": "GBR", "codebase": "WUK" }
        ];

        Country.destroy({ truncate: true }).then(() => {
            Country.bulkCreate(countries, {
                returning: true,
                ignoreDuplicates: false
            }).then(function () {
                callback();
            });
        });
    }

    async.waterfall([clientSeeder, userSeeder, countriesSeeder], function (err) {
        if (err) console.error(err);
        else console.info("DB seed completed!");
        process.exit();
    });
}

init();
