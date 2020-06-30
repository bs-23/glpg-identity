const path = require("path");
const async = require("async");

async function init() {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));

    await config.initEnvironmentVariables();

    const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

    await sequelize.cdpConnector.query("CREATE SCHEMA IF NOT EXISTS ciam");

    const Application = require(path.join(process.cwd(), "src/modules/application/server/application.model"));
    const User = require(path.join(process.cwd(), "src/modules/user/server/user.model"));
    const HCP = require(path.join(process.cwd(), "src/modules/hcp/server/hcp_profile.model"));
    const Consent = require(path.join(process.cwd(), "src/modules/consent/server/consent.model"));

    await sequelize.cdpConnector.sync();

    function tempHcpsSeeder(callback) {
        const hcpUsers = [
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john1", "last_name": "doe", "email": "abc1@gmail.com", "password": "strong-password", "phone": "12345567", "uuid": "ABCD123451", "is_active": true },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john2", "last_name": "doe", "email": "abc2@gmail.com", "password": "strong-password", "phone": "12345567", "uuid": "ABCD123452", "is_active": false },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john3", "last_name": "doe", "email": "abc3@gmail.com", "password": "strong-password", "phone": "12345567", "uuid": "ABCD123453", "is_active": true },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john4", "last_name": "doe", "email": "abc4@gmail.com", "password": "strong-password", "phone": "12345567", "uuid": "ABCD123454", "is_active": false },
            { "application_id": "6f508055-a085-4c97-b0d6-f14abc9c2f7c", "first_name": "john5", "last_name": "doe", "email": "abc5@gmail.com", "password": "strong-password", "phone": "12345567", "uuid": "ABCD123455", "is_active": true }
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
                password: "strong-password",
                is_active: true
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

    function consentSeeder(callback) {
        const consents = [

            { "title": "Sharing personal data with 3rd parties", "type": "online", "opt-type": "single", "category": "GDPR", "country_code": "BE" },
            { "title": "Sharing personal data with 3rd parties", "type": "online", "opt-type": "single", "category": "GDPR", "country_code": "IT" },
            { "title": "Sharing personal data with 3rd parties", "type": "online", "opt-type": "single", "category": "GDPR", "country_code": "NL" },
            { "title": "Sharing personal data with 3rd parties", "type": "online", "opt-type": "single", "category": "GDPR", "country_code": "ES" },
            { "title": "Sharing personal data with 3rd parties", "type": "online", "opt-type": "double", "category": "GDPR", "country_code": "DE" },
            { "title": "Sharing personal data with 3rd parties", "type": "online", "opt-type": "single", "category": "GDPR", "country_code": "UK" },
            { "title": "Sharing personal data with 3rd parties", "type": "online", "opt-type": "single", "category": "GDPR", "country_code": "FR" },

            { "title": "Personal data processing for resumes (CV)", "type": "online", "opt-type": "single", "category": "GDPR", "country_code": "BE" },
            { "title": "Personal data processing for resumes (CV)", "type": "online", "opt-type": "single", "category": "GDPR", "country_code": "IT" },
            { "title": "Personal data processing for resumes (CV)", "type": "online", "opt-type": "single", "category": "GDPR", "country_code": "NL" },
            { "title": "Personal data processing for resumes (CV)", "type": "online", "opt-type": "single", "category": "GDPR", "country_code": "ES" },
            { "title": "Personal data processing for resumes (CV)", "type": "online", "opt-type": "double", "category": "GDPR", "country_code": "DE" },
            { "title": "Personal data processing for resumes (CV)", "type": "online", "opt-type": "single", "category": "GDPR", "country_code": "UK" },
            { "title": "Personal data processing for resumes (CV)", "type": "online", "opt-type": "single", "category": "GDPR", "country_code": "FR" },

            { "title": "Sample Request", "type": "online", "opt-type": "double", "category": "DM", "country_code": "BE" },
            { "title": "Sample Request", "type": "online", "opt-type": "double", "category": "DM", "country_code": "IT" },
            { "title": "Sample Request", "type": "online", "opt-type": "double", "category": "DM", "country_code": "NL" },
            { "title": "Sample Request", "type": "online", "opt-type": "double", "category": "DM", "country_code": "ES" },
            { "title": "Sample Request", "type": "online", "opt-type": "double", "category": "DM", "country_code": "DE" },
            { "title": "Sample Request", "type": "online", "opt-type": "double", "category": "DM", "country_code": "UK" },
            { "title": "Sample Request", "type": "online", "opt-type": "double", "category": "DM", "country_code": "FR" },

            { "title": "Invite to KOL Webminar", "type": "online", "opt-type": "single", "category": "MC", "country_code": "BE" },
            { "title": "Invite to KOL Webminar", "type": "online", "opt-type": "double", "category": "MC", "country_code": "IT" },
            { "title": "Invite to KOL Webminar", "type": "online", "opt-type": "double", "category": "MC", "country_code": "NL" },
            { "title": "Invite to KOL Webminar", "type": "online", "opt-type": "double", "category": "MC", "country_code": "ES" },
            { "title": "Invite to KOL Webminar", "type": "online", "opt-type": "double", "category": "MC", "country_code": "DE" },
            { "title": "Invite to KOL Webminar", "type": "online", "opt-type": "double", "category": "MC", "country_code": "UK" },
            { "title": "Invite to KOL Webminar", "type": "online", "opt-type": "double", "category": "MC", "country_code": "FR" },

            { "title": "Create credentials for gated HCP area", "type": "online", "opt-type": "single", "category": "MC", "country_code": "BE" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt-type": "double", "category": "MC", "country_code": "IT" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt-type": "double", "category": "MC", "country_code": "NL" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt-type": "double", "category": "MC", "country_code": "ES" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt-type": "double", "category": "MC", "country_code": "DE" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt-type": "double", "category": "MC", "country_code": "UK" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt-type": "double", "category": "MC", "country_code": "FR" },

            { "title": "Create credentials for gated HCP area", "type": "online", "opt-type": "double", "category": "DM", "country_code": "BE" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt-type": "double", "category": "DM", "country_code": "IT" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt-type": "double", "category": "DM", "country_code": "NL" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt-type": "double", "category": "DM", "country_code": "ES" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt-type": "double", "category": "DM", "country_code": "DE" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt-type": "double", "category": "DM", "country_code": "UK" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt-type": "double", "category": "DM", "country_code": "FR" },

            { "title": "Register to E-mail Newsletter (Mass email)", "type": "online", "opt-type": "double", "category": "DM", "country_code": "BE" },
            { "title": "Register to E-mail Newsletter (Mass email)", "type": "online", "opt-type": "double", "category": "DM", "country_code": "IT" },
            { "title": "Register to E-mail Newsletter (Mass email)", "type": "online", "opt-type": "double", "category": "DM", "country_code": "NL" },
            { "title": "Register to E-mail Newsletter (Mass email)", "type": "online", "opt-type": "double", "category": "DM", "country_code": "ES" },
            { "title": "Register to E-mail Newsletter (Mass email)", "type": "online", "opt-type": "double", "category": "DM", "country_code": "DE" },
            { "title": "Register to E-mail Newsletter (Mass email)", "type": "online", "opt-type": "double", "category": "DM", "country_code": "UK" },
            { "title": "Register to E-mail Newsletter (Mass email)", "type": "online", "opt-type": "double", "category": "DM", "country_code": "FR" },


            { "title": "Send congress Agenda via email", "type": "online", "opt-type": "single", "category": "MC", "country_code": "BE" },
            { "title": "Send congress Agenda via email", "type": "online", "opt-type": "double", "category": "MC", "country_code": "IT" },
            { "title": "Send congress Agenda via email", "type": "online", "opt-type": "double", "category": "MC", "country_code": "NL" },
            { "title": "Send congress Agenda via email", "type": "online", "opt-type": "double", "category": "MC", "country_code": "ES" },
            { "title": "Send congress Agenda via email", "type": "online", "opt-type": "double", "category": "MC", "country_code": "DE" },
            { "title": "Send congress Agenda via email", "type": "online", "opt-type": "double", "category": "MC", "country_code": "UK" },
            { "title": "Send congress Agenda via email", "type": "online", "opt-type": "double", "category": "MC", "country_code": "FR" },

            { "title": "Congress Newsletter", "type": "online", "opt-type": "single", "category": "MC", "country_code": "BE" },
            { "title": "Congress Newsletter", "type": "online", "opt-type": "double", "category": "MC", "country_code": "IT" },
            { "title": "Congress Newsletter", "type": "online", "opt-type": "double", "category": "MC", "country_code": "NL" },
            { "title": "Congress Newsletter", "type": "online", "opt-type": "double", "category": "MC", "country_code": "ES" },
            { "title": "Congress Newsletter", "type": "online", "opt-type": "double", "category": "MC", "country_code": "DE" },
            { "title": "Congress Newsletter", "type": "online", "opt-type": "double", "category": "MC", "country_code": "UK" },
            { "title": "Congress Newsletter", "type": "online", "opt-type": "double", "category": "MC", "country_code": "FR" },

            { "title": "Send Email about clinical trial studies", "type": "online", "opt-type": "single", "category": "MC", "country_code": "BE" },
            { "title": "Send Email about clinical trial studies", "type": "online", "opt-type": "double", "category": "MC", "country_code": "IT" },
            { "title": "Send Email about clinical trial studies", "type": "online", "opt-type": "double", "category": "MC", "country_code": "NL" },
            { "title": "Send Email about clinical trial studies", "type": "online", "opt-type": "double", "category": "MC", "country_code": "ES" },
            { "title": "Send Email about clinical trial studies", "type": "online", "opt-type": "double", "category": "MC", "country_code": "DE" },
            { "title": "Send Email about clinical trial studies", "type": "online", "opt-type": "double", "category": "MC", "country_code": "UK" },
            { "title": "Send Email about clinical trial studies", "type": "online", "opt-type": "double", "category": "MC", "country_code": "FR" },


            { "title": "That medical information is shorten for teasering content and better readability", "type": "online", "opt-type": "single", "category": "MC", "country_code": "BE" },
            { "title": "That medical information is shorten for teasering content and better readability", "type": "online", "opt-type": "double", "category": "MC", "country_code": "IT" },
            { "title": "That medical information is shorten for teasering content and better readability", "type": "online", "opt-type": "double", "category": "MC", "country_code": "NL" },
            { "title": "That medical information is shorten for teasering content and better readability", "type": "online", "opt-type": "double", "category": "MC", "country_code": "ES" },
            { "title": "That medical information is shorten for teasering content and better readability", "type": "online", "opt-type": "double", "category": "MC", "country_code": "DE" },
            { "title": "That medical information is shorten for teasering content and better readability", "type": "online", "opt-type": "double", "category": "MC", "country_code": "UK" },
            { "title": "That medical information is shorten for teasering content and better readability", "type": "online", "opt-type": "double", "category": "MC", "country_code": "FR" },

            { "title": "Send Mode of Action rich media content", "type": "online", "opt-type": "single", "category": "MC", "country_code": "BE" },
            { "title": "Send Mode of Action rich media content", "type": "online", "opt-type": "double", "category": "MC", "country_code": "IT" },
            { "title": "Send Mode of Action rich media content", "type": "online", "opt-type": "double", "category": "MC", "country_code": "NL" },
            { "title": "Send Mode of Action rich media content", "type": "online", "opt-type": "double", "category": "MC", "country_code": "ES" },
            { "title": "Send Mode of Action rich media content", "type": "online", "opt-type": "double", "category": "MC", "country_code": "DE" },
            { "title": "Send Mode of Action rich media content", "type": "online", "opt-type": "double", "category": "MC", "country_code": "UK" },
            { "title": "Send Mode of Action rich media content", "type": "online", "opt-type": "double", "category": "MC", "country_code": "FR" },

            { "title": "Send e-Detailing aid", "type": "online", "opt-type": "double", "category": "DM", "country_code": "BE" },
            { "title": "Send e-Detailing aid", "type": "online", "opt-type": "double", "category": "DM", "country_code": "IT" },
            { "title": "Send e-Detailing aid", "type": "online", "opt-type": "double", "category": "DM", "country_code": "NL" },
            { "title": "Send e-Detailing aid", "type": "online", "opt-type": "double", "category": "DM", "country_code": "ES" },
            { "title": "Send e-Detailing aid", "type": "online", "opt-type": "double", "category": "DM", "country_code": "DE" },
            { "title": "Send e-Detailing aid", "type": "online", "opt-type": "double", "category": "DM", "country_code": "UK" },
            { "title": "Send e-Detailing aid", "type": "online", "opt-type": "double", "category": "DM", "country_code": "FR" },

            { "title": "Invite to Remote Engagement", "type": "online", "opt-type": "double", "category": "DM", "country_code": "BE" },
            { "title": "Invite to Remote Engagement", "type": "online", "opt-type": "double", "category": "DM", "country_code": "IT" },
            { "title": "Invite to Remote Engagement", "type": "online", "opt-type": "double", "category": "DM", "country_code": "NL" },
            { "title": "Invite to Remote Engagement", "type": "online", "opt-type": "double", "category": "DM", "country_code": "ES" },
            { "title": "Invite to Remote Engagement", "type": "online", "opt-type": "double", "category": "DM", "country_code": "DE" },
            { "title": "Invite to Remote Engagement", "type": "online", "opt-type": "double", "category": "DM", "country_code": "UK" },
            { "title": "Invite to Remote Engagement", "type": "online", "opt-type": "double", "category": "DM", "country_code": "FR" },

            { "title": "Manage 3rd Party Social Logins such as Docheck, TakiDex", "type": "online", "opt-type": "single", "category": "GDPR", "country_code": "BE" },
            { "title": "Manage 3rd Party Social Logins such as Docheck, TakiDex", "type": "online", "opt-type": "single", "category": "GDPR", "country_code": "IT" },
            { "title": "Manage 3rd Party Social Logins such as Docheck, TakiDex", "type": "online", "opt-type": "single", "category": "GDPR", "country_code": "NL" },
            { "title": "Manage 3rd Party Social Logins such as Docheck, TakiDex", "type": "online", "opt-type": "single", "category": "GDPR", "country_code": "ES" },
            { "title": "Manage 3rd Party Social Logins such as Docheck, TakiDex", "type": "online", "opt-type": "double", "category": "GDPR", "country_code": "DE" },
            { "title": "Manage 3rd Party Social Logins such as Docheck, TakiDex", "type": "online", "opt-type": "single", "category": "GDPR", "country_code": "UK" },
            { "title": "Manage 3rd Party Social Logins such as Docheck, TakiDex", "type": "online", "opt-type": "single", "category": "GDPR", "country_code": "FR" },

            { "title": "Send CLM content after RepSale visit", "type": "online", "opt-type": "double", "category": "DM", "country_code": "BE" },
            { "title": "Send CLM content after RepSale visit", "type": "online", "opt-type": "double", "category": "DM", "country_code": "IT" },
            { "title": "Send CLM content after RepSale visit", "type": "online", "opt-type": "double", "category": "DM", "country_code": "NL" },
            { "title": "Send CLM content after RepSale visit", "type": "online", "opt-type": "double", "category": "DM", "country_code": "ES" },
            { "title": "Send CLM content after RepSale visit", "type": "online", "opt-type": "double", "category": "DM", "country_code": "DE" },
            { "title": "Send CLM content after RepSale visit", "type": "online", "opt-type": "double", "category": "DM", "country_code": "UK" },
            { "title": "Send CLM content after RepSale visit", "type": "online", "opt-type": "double", "category": "DM", "country_code": "FR" },



        ];

        Consent.destroy({ truncate: true }).then(() => {
            Consent.bulkCreate(consents, {
                returning: true,
                ignoreDuplicates: false
            }).then(function () {
                callback();
            });
        });
    }

    async.waterfall([applicationSeeder, userSeeder, tempHcpsSeeder, consentSeeder], function (err) {
        if (err) console.error(err);
        else console.info("DB seed completed!");
        process.exit();
    });
}

init();
