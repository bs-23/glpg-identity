const path = require("path");
const async = require("async");

async function init() {
    require("dotenv").config();

    const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
    const secretsManager = require(path.join(process.cwd(), 'src/config/server/lib/secrets-manager'));

    const secrets = await secretsManager.getSecrets();

    for (const key in secrets) {
        if(secrets.hasOwnProperty(key)) {
            nodecache.setValue(key, secrets[key]);
        }
    }

    const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

    await sequelize.cdpConnector.query("CREATE SCHEMA IF NOT EXISTS ciam");

    const Application = require(path.join(process.cwd(), "src/modules/core/server/application.model"));
    const User = require(path.join(process.cwd(), "src/modules/user/server/user.model"));
    const HCP = require(path.join(process.cwd(), "src/modules/hcp/server/hcp_profile.model"));

    await sequelize.cdpConnector.sync();

    function tempHcpsSeeder(callback) {
        const hcpUsers = [
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john1", "last_name": "doe", "email": "abc1@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": true },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john2", "last_name": "doe", "email": "abc2@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": false },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john3", "last_name": "doe", "email": "abc3@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": true },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john4", "last_name": "doe", "email": "abc4@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": false },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john5", "last_name": "doe", "email": "abc5@gmail.com", "password": "strong-password", "phone": "12345567", "one_key_id": "ABCD12345", "is_active": true }
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

    function applicationSeeder(callback) {
        Application.findOrCreate({
            where: { email: "hcp-portal@glpg.com" }, defaults: {
                name: "Authoring Experience Service Account",
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

    async.waterfall([applicationSeeder, userSeeder, tempHcpsSeeder], function (err) {
        if (err) console.error(err);
        else console.info("DB seed completed!");
        process.exit();
    });
}

init();
