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

    function tempHcpsSeeder(callback) {
        const hcpUsers = [
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john1", "last_name": "doe", "email": "abc1@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": true },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john2", "last_name": "doe", "email": "abc2@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": false },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john3", "last_name": "doe", "email": "abc3@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": true },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john4", "last_name": "doe", "email": "abc4@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": false },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john5", "last_name": "doe", "email": "abc5@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": true },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john6", "last_name": "doe", "email": "abc6@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": true },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john7", "last_name": "doe", "email": "abc7@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": true },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john8", "last_name": "doe", "email": "abc8@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": false },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john9", "last_name": "doe", "email": "abc9@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": true },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john10", "last_name": "doe", "email": "abc10@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": true },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john11", "last_name": "doe", "email": "abc11@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": false },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john12", "last_name": "doe", "email": "abc12@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": true },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john13", "last_name": "doe", "email": "abc13@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": true },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john14", "last_name": "doe", "email": "abc14@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": true },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john15", "last_name": "doe", "email": "abc15@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": true },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john16", "last_name": "doe", "email": "abc16@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": false },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john17", "last_name": "doe", "email": "abc17@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": true },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john18", "last_name": "doe", "email": "abc18@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": true },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john19", "last_name": "doe", "email": "abc19@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": false }
        ];

        HCP.destroy({ truncate: true }).then(() => {
            HCP.bulkCreate(hcpUsers, {
                returning: true,
                ignoreDuplicates: false
            }).then(function () {
                callback();
            });
        });
    }


    function clientSeeder(callback) {
        Client.findOrCreate({
            where: { email: "service.hcp@glpg-hcp.com" }, defaults: {
                name: "AEM HCP Portal Service User",
                password: "temporary-password"
            }
        }).then(function () {
            callback();
        });
    }

    function userSeeder(callback) {
        User.findOrCreate({
            where: { email: "admin@glpg-cdp.com" }, defaults: {
                name: "Admin",
                password: "temporary-password",
                type: "admin"
            }
        }).then(function () {
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

    async.waterfall([clientSeeder, userSeeder, countriesSeeder, tempHcpsSeeder], function (err) {
        if (err) console.error(err);
        else console.info("DB seed completed!");
        process.exit();
    });
}

init();
