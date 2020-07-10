const path = require('path');
const async = require('async');

async function init() {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));

    await config.initEnvironmentVariables();

    const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

    await sequelize.cdpConnector.query('CREATE SCHEMA IF NOT EXISTS ciam');


    const Application = require(path.join(process.cwd(), 'src/modules/application/server/application.model'));
    const User = require(path.join(process.cwd(), 'src/modules/user/server/user.model'));
    const Consent = require(path.join(process.cwd(), 'src/modules/consent/server/consent.model'));
    const UserPermission = require(path.join(process.cwd(), "src/modules/user/server/user-permission.model"));
    const Permission = require(path.join(process.cwd(), "src/modules/user/server/permission/permission.model"));
    const { Modules } = require(path.join(process.cwd(), 'src/modules/user/server/authorization/modules.constant'));
    require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.model'));
    require(path.join(process.cwd(), 'src/modules/hcp/server/hcp_profile.model'));
    require(path.join(process.cwd(), 'src/modules/hcp/server/hcp_consents.model'));
    require(path.join(process.cwd(), 'src/modules/user/server/reset-password.model'));


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

    function permissionSeeder(callback) {
        const permissions = [

            { "module": Modules.USER, "status": "active", "created_by": "7a6492f0-022a-40ab-9b51-d1faf5d74385", "updated_by": "7a6492f0-022a-40ab-9b51-d1faf5d74385" },
            { "module": Modules.HCP, "status": "active", "created_by": "7a6492f0-022a-40ab-9b51-d1faf5d74385", "updated_by": "7a6492f0-022a-40ab-9b51-d1faf5d74385" },
            { "module": Modules.ALL_Permission, "status": "active", "created_by": "7a6492f0-022a-40ab-9b51-d1faf5d74385", "updated_by": "7a6492f0-022a-40ab-9b51-d1faf5d74385" }
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

    async.waterfall([applicationSeeder, userSeeder, consentSeeder, permissionSeeder], function (err) {
        if (err) console.error(err);
        else console.info("DB seed completed!");
        process.exit();
    });
}

init();
