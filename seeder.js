const path = require("path");
const async = require("async");

async function init() {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));

    await config.initEnvironmentVariables();

    const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

    await sequelize.cdpConnector.query("CREATE SCHEMA IF NOT EXISTS ciam");

    const Application = require(path.join(process.cwd(), "src/modules/application/server/application.model"));
    const User = require(path.join(process.cwd(), "src/modules/user/server/user.model"));
    const Consent = require(path.join(process.cwd(), "src/modules/consent/server/consent.model"));
    const UserPermission = require(path.join(process.cwd(), "src/modules/user/server/user-permission.model"));
    const Permission = require(path.join(process.cwd(), "src/modules/permission/permission.model"));

    const { Actions } = require(path.join(process.cwd(), 'src/config/server/lib/actions.constant'));
    require(path.join(process.cwd(), "src/modules/hcp/server/hcp_profile.model"));
    require(path.join(process.cwd(), "src/modules/hcp/server/hcp_consents.model"));
    require(path.join(process.cwd(), 'src/modules/user/server/reset-password.model'))

    await sequelize.cdpConnector.sync();

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
                password: "strong-password",
                type: "admin"
            }
        }).then(function () {
            callback();
        });
    }
    function userpermissionSeeder(callback) {
        const userpermissions = [

            { "permissionId": "dfc05285-cd84-42fc-afb8-620a5229248c", "userId": "1fd75693-ce87-4bf7-801a-61b1d7275c4f", "created_by": "1fd75693-ce87-4bf7-801a-61b1d7275c4f", "updated_by": "1fd75693-ce87-4bf7-801a-61b1d7275c4f" },

        ];

        UserPermission.destroy({ truncate: true }).then(() => {
            UserPermission.bulkCreate(userpermissions, {
                returning: true,
                ignoreDuplicates: false
            }).then(function () {
                callback();
            });
        });
    }
    function permissionSeeder(callback) {
        const permissions = [

            { "action": Actions.USER_GET_LIST, "status": "active", "created_by": "1fd75693-ce87-4bf7-801a-61b1d7275c4f", "updated_by": "1fd75693-ce87-4bf7-801a-61b1d7275c4f" },
            { "action": Actions.USER_POST, "status": "active", "created_by": "1fd75693-ce87-4bf7-801a-61b1d7275c4f", "updated_by": "1fd75693-ce87-4bf7-801a-61b1d7275c4f" },
            { "action": Actions.USER_GET, "status": "active", "created_by": "1fd75693-ce87-4bf7-801a-61b1d7275c4f", "updated_by": "1fd75693-ce87-4bf7-801a-61b1d7275c4f" },
            { "action": Actions.USER_GET_PROFILE, "status": "active", "created_by": "1fd75693-ce87-4bf7-801a-61b1d7275c4f", "updated_by": "1fd75693-ce87-4bf7-801a-61b1d7275c4f" },
            { "action": Actions.USER_POST_CHANGE_PASSWORD, "status": "active", "created_by": "1fd75693-ce87-4bf7-801a-61b1d7275c4f", "updated_by": "1fd75693-ce87-4bf7-801a-61b1d7275c4f" },
            { "action": Actions.USER_POST_SEND_PASSWORD_RESET_LINK, "status": "active", "created_by": "1fd75693-ce87-4bf7-801a-61b1d7275c4f", "updated_by": "1fd75693-ce87-4bf7-801a-61b1d7275c4f" },
            { "action": Actions.USER_PUT_SEND_PASSWORD_RESET, "status": "active", "created_by": "1fd75693-ce87-4bf7-801a-61b1d7275c4f", "updated_by": "1fd75693-ce87-4bf7-801a-61b1d7275c4f" },
        ];


        Permission.destroy({ truncate:  { cascade: true } }).then(() => {
            Permission.bulkCreate(permissions, {
                returning: true,
                ignoreDuplicates: false
            }).then(function () {
                callback();
            });
        });
    }



    function consentSeeder(callback) {
        const consents = [

            { "title": "Sample Request", "type": "online", "opt_type": "double", "category": "DM", "country_code": "BE", "purpose": "n/a" },
            { "title": "Sample Request", "type": "online", "opt_type": "double", "category": "DM", "country_code": "IT", "purpose": "n/a" },
            { "title": "Sample Request", "type": "online", "opt_type": "double", "category": "DM", "country_code": "NL", "purpose": "n/a" },
            { "title": "Sample Request", "type": "online", "opt_type": "double", "category": "DM", "country_code": "ES", "purpose": "n/a" },
            { "title": "Sample Request", "type": "online", "opt_type": "double", "category": "DM", "country_code": "DE", "purpose": "n/a" },
            { "title": "Sample Request", "type": "online", "opt_type": "double", "category": "DM", "country_code": "UK", "purpose": "n/a" },
            { "title": "Sample Request", "type": "online", "opt_type": "double", "category": "DM", "country_code": "FR", "purpose": "n/a" },

            { "title": "Invite to KOL Webminar", "type": "online", "opt_type": "single", "category": "MC", "country_code": "BE", "purpose": "n/a" },
            { "title": "Invite to KOL Webminar", "type": "online", "opt_type": "double", "category": "MC", "country_code": "IT", "purpose": "n/a" },
            { "title": "Invite to KOL Webminar", "type": "online", "opt_type": "double", "category": "MC", "country_code": "NL", "purpose": "n/a" },
            { "title": "Invite to KOL Webminar", "type": "online", "opt_type": "double", "category": "MC", "country_code": "ES", "purpose": "n/a" },
            { "title": "Invite to KOL Webminar", "type": "online", "opt_type": "double", "category": "MC", "country_code": "DE", "purpose": "n/a" },
            { "title": "Invite to KOL Webminar", "type": "online", "opt_type": "double", "category": "MC", "country_code": "UK", "purpose": "n/a" },
            { "title": "Invite to KOL Webminar", "type": "online", "opt_type": "double", "category": "MC", "country_code": "FR", "purpose": "n/a" },

            { "title": "Create credentials for gated HCP area", "type": "online", "opt_type": "single", "category": "MC", "country_code": "BE", "purpose": "n/a" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt_type": "double", "category": "MC", "country_code": "IT", "purpose": "n/a" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt_type": "double", "category": "MC", "country_code": "NL", "purpose": "n/a" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt_type": "double", "category": "MC", "country_code": "ES", "purpose": "n/a" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt_type": "double", "category": "MC", "country_code": "DE", "purpose": "n/a" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt_type": "double", "category": "MC", "country_code": "UK", "purpose": "n/a" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt_type": "double", "category": "MC", "country_code": "FR", "purpose": "n/a" },

            { "title": "Create credentials for gated HCP area", "type": "online", "opt_type": "double", "category": "DM", "country_code": "BE", "purpose": "n/a" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt_type": "double", "category": "DM", "country_code": "IT", "purpose": "n/a" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt_type": "double", "category": "DM", "country_code": "NL", "purpose": "n/a" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt_type": "double", "category": "DM", "country_code": "ES", "purpose": "n/a" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt_type": "double", "category": "DM", "country_code": "DE", "purpose": "n/a" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt_type": "double", "category": "DM", "country_code": "UK", "purpose": "n/a" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt_type": "double", "category": "DM", "country_code": "FR", "purpose": "n/a" },

            { "title": "Register to E-mail Newsletter (Mass email)", "type": "online", "opt_type": "double", "category": "DM", "country_code": "BE", "purpose": "n/a" },
            { "title": "Register to E-mail Newsletter (Mass email)", "type": "online", "opt_type": "double", "category": "DM", "country_code": "IT", "purpose": "n/a" },
            { "title": "Register to E-mail Newsletter (Mass email)", "type": "online", "opt_type": "double", "category": "DM", "country_code": "NL", "purpose": "n/a" },
            { "title": "Register to E-mail Newsletter (Mass email)", "type": "online", "opt_type": "double", "category": "DM", "country_code": "ES", "purpose": "n/a" },
            { "title": "Register to E-mail Newsletter (Mass email)", "type": "online", "opt_type": "double", "category": "DM", "country_code": "DE", "purpose": "n/a" },
            { "title": "Register to E-mail Newsletter (Mass email)", "type": "online", "opt_type": "double", "category": "DM", "country_code": "UK", "purpose": "n/a" },
            { "title": "Register to E-mail Newsletter (Mass email)", "type": "online", "opt_type": "double", "category": "DM", "country_code": "FR", "purpose": "n/a" },


            { "title": "Send congress Agenda via email", "type": "online", "opt_type": "single", "category": "MC", "country_code": "BE", "purpose": "n/a" },
            { "title": "Send congress Agenda via email", "type": "online", "opt_type": "double", "category": "MC", "country_code": "IT", "purpose": "n/a" },
            { "title": "Send congress Agenda via email", "type": "online", "opt_type": "double", "category": "MC", "country_code": "NL", "purpose": "n/a" },
            { "title": "Send congress Agenda via email", "type": "online", "opt_type": "double", "category": "MC", "country_code": "ES", "purpose": "n/a" },
            { "title": "Send congress Agenda via email", "type": "online", "opt_type": "double", "category": "MC", "country_code": "DE", "purpose": "n/a" },
            { "title": "Send congress Agenda via email", "type": "online", "opt_type": "double", "category": "MC", "country_code": "UK", "purpose": "n/a" },
            { "title": "Send congress Agenda via email", "type": "online", "opt_type": "double", "category": "MC", "country_code": "FR", "purpose": "n/a" },

            { "title": "Congress Newsletter", "type": "online", "opt_type": "single", "category": "MC", "country_code": "BE", "purpose": "n/a" },
            { "title": "Congress Newsletter", "type": "online", "opt_type": "double", "category": "MC", "country_code": "IT", "purpose": "n/a" },
            { "title": "Congress Newsletter", "type": "online", "opt_type": "double", "category": "MC", "country_code": "NL", "purpose": "n/a" },
            { "title": "Congress Newsletter", "type": "online", "opt_type": "double", "category": "MC", "country_code": "ES", "purpose": "n/a" },
            { "title": "Congress Newsletter", "type": "online", "opt_type": "double", "category": "MC", "country_code": "DE", "purpose": "n/a" },
            { "title": "Congress Newsletter", "type": "online", "opt_type": "double", "category": "MC", "country_code": "UK", "purpose": "n/a" },
            { "title": "Congress Newsletter", "type": "online", "opt_type": "double", "category": "MC", "country_code": "FR", "purpose": "n/a" },

            { "title": "Send Email about clinical trial studies", "type": "online", "opt_type": "single", "category": "MC", "country_code": "BE", "purpose": "n/a" },
            { "title": "Send Email about clinical trial studies", "type": "online", "opt_type": "double", "category": "MC", "country_code": "IT", "purpose": "n/a" },
            { "title": "Send Email about clinical trial studies", "type": "online", "opt_type": "double", "category": "MC", "country_code": "NL", "purpose": "n/a" },
            { "title": "Send Email about clinical trial studies", "type": "online", "opt_type": "double", "category": "MC", "country_code": "ES", "purpose": "n/a" },
            { "title": "Send Email about clinical trial studies", "type": "online", "opt_type": "double", "category": "MC", "country_code": "DE", "purpose": "n/a" },
            { "title": "Send Email about clinical trial studies", "type": "online", "opt_type": "double", "category": "MC", "country_code": "UK", "purpose": "n/a" },
            { "title": "Send Email about clinical trial studies", "type": "online", "opt_type": "double", "category": "MC", "country_code": "FR", "purpose": "n/a" },

            { "title": "That medical information is shorten for teasering content and better readability", "type": "online", "opt_type": "single", "category": "MC", "country_code": "BE", "purpose": "n/a" },
            { "title": "That medical information is shorten for teasering content and better readability", "type": "online", "opt_type": "double", "category": "MC", "country_code": "IT", "purpose": "n/a" },
            { "title": "That medical information is shorten for teasering content and better readability", "type": "online", "opt_type": "double", "category": "MC", "country_code": "NL", "purpose": "n/a" },
            { "title": "That medical information is shorten for teasering content and better readability", "type": "online", "opt_type": "double", "category": "MC", "country_code": "ES", "purpose": "n/a" },
            { "title": "That medical information is shorten for teasering content and better readability", "type": "online", "opt_type": "double", "category": "MC", "country_code": "DE", "purpose": "n/a" },
            { "title": "That medical information is shorten for teasering content and better readability", "type": "online", "opt_type": "double", "category": "MC", "country_code": "UK", "purpose": "n/a" },
            { "title": "That medical information is shorten for teasering content and better readability", "type": "online", "opt_type": "double", "category": "MC", "country_code": "FR", "purpose": "n/a" },

            { "title": "Send Mode of Action rich media content", "type": "online", "opt_type": "single", "category": "MC", "country_code": "BE", "purpose": "n/a" },
            { "title": "Send Mode of Action rich media content", "type": "online", "opt_type": "double", "category": "MC", "country_code": "IT", "purpose": "n/a" },
            { "title": "Send Mode of Action rich media content", "type": "online", "opt_type": "double", "category": "MC", "country_code": "NL", "purpose": "n/a" },
            { "title": "Send Mode of Action rich media content", "type": "online", "opt_type": "double", "category": "MC", "country_code": "ES", "purpose": "n/a" },
            { "title": "Send Mode of Action rich media content", "type": "online", "opt_type": "double", "category": "MC", "country_code": "DE", "purpose": "n/a" },
            { "title": "Send Mode of Action rich media content", "type": "online", "opt_type": "double", "category": "MC", "country_code": "UK", "purpose": "n/a" },
            { "title": "Send Mode of Action rich media content", "type": "online", "opt_type": "double", "category": "MC", "country_code": "FR", "purpose": "n/a" },

            { "title": "Send e-Detailing aid", "type": "online", "opt_type": "double", "category": "DM", "country_code": "BE", "purpose": "n/a" },
            { "title": "Send e-Detailing aid", "type": "online", "opt_type": "double", "category": "DM", "country_code": "IT", "purpose": "n/a" },
            { "title": "Send e-Detailing aid", "type": "online", "opt_type": "double", "category": "DM", "country_code": "NL", "purpose": "n/a" },
            { "title": "Send e-Detailing aid", "type": "online", "opt_type": "double", "category": "DM", "country_code": "ES", "purpose": "n/a" },
            { "title": "Send e-Detailing aid", "type": "online", "opt_type": "double", "category": "DM", "country_code": "DE", "purpose": "n/a" },
            { "title": "Send e-Detailing aid", "type": "online", "opt_type": "double", "category": "DM", "country_code": "UK", "purpose": "n/a" },
            { "title": "Send e-Detailing aid", "type": "online", "opt_type": "double", "category": "DM", "country_code": "FR", "purpose": "n/a" },

            { "title": "Invite to Remote Engagement", "type": "online", "opt_type": "double", "category": "DM", "country_code": "BE", "purpose": "n/a" },
            { "title": "Invite to Remote Engagement", "type": "online", "opt_type": "double", "category": "DM", "country_code": "IT", "purpose": "n/a" },
            { "title": "Invite to Remote Engagement", "type": "online", "opt_type": "double", "category": "DM", "country_code": "NL", "purpose": "n/a" },
            { "title": "Invite to Remote Engagement", "type": "online", "opt_type": "double", "category": "DM", "country_code": "ES", "purpose": "n/a" },
            { "title": "Invite to Remote Engagement", "type": "online", "opt_type": "double", "category": "DM", "country_code": "DE", "purpose": "n/a" },
            { "title": "Invite to Remote Engagement", "type": "online", "opt_type": "double", "category": "DM", "country_code": "UK", "purpose": "n/a" },
            { "title": "Invite to Remote Engagement", "type": "online", "opt_type": "double", "category": "DM", "country_code": "FR", "purpose": "n/a" },

            { "title": "Send CLM content after RepSale visit", "type": "online", "opt_type": "double", "category": "DM", "country_code": "BE", "purpose": "n/a" },
            { "title": "Send CLM content after RepSale visit", "type": "online", "opt_type": "double", "category": "DM", "country_code": "IT", "purpose": "n/a" },
            { "title": "Send CLM content after RepSale visit", "type": "online", "opt_type": "double", "category": "DM", "country_code": "NL", "purpose": "n/a" },
            { "title": "Send CLM content after RepSale visit", "type": "online", "opt_type": "double", "category": "DM", "country_code": "ES", "purpose": "n/a" },
            { "title": "Send CLM content after RepSale visit", "type": "online", "opt_type": "double", "category": "DM", "country_code": "DE", "purpose": "n/a" },
            { "title": "Send CLM content after RepSale visit", "type": "online", "opt_type": "double", "category": "DM", "country_code": "UK", "purpose": "n/a" },
            { "title": "Send CLM content after RepSale visit", "type": "online", "opt_type": "double", "category": "DM", "country_code": "FR", "purpose": "n/a" }
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

    async.waterfall([applicationSeeder, userSeeder, consentSeeder, userpermissionSeeder], function (err) {
        if (err) console.error(err);
        else console.info("DB seed completed!");
        process.exit();
    });
}

init();
