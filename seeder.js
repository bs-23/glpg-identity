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

    function consentSeeder(callback) {
        const consents = [
            { "title": "Sample Request", "slug": "Sample_Request", "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "BE", "purpose": "n/a" },
            { "title": "Invite to KOL Webminar", "slug": "Invite_to_KOL_Webminar", "type": "online", "opt_type": "single", "category": "mc", "category_title": "Medical Consent", "country_iso2": "BE", "purpose": "n/a" },
            { "title": "Create credentials for gated HCP area", "slug": "Create_credentials_for_gated_HCP_area", "type": "online", "opt_type": "single", "category": "mc", "category_title": "Medical Consent", "country_iso2": "BE", "purpose": "n/a" },
            { "title": "Register to E-mail Newsletter (Mass email)", "slug": "Register_to_E-mail_Newsletter_(Mass_email)", "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "BE", "purpose": "n/a" },
            { "title": "Send congress Agenda via email", "slug": "Send_congress_Agenda_via_email", "type": "online", "opt_type": "single", "category": "mc", "category_title": "Medical Consent", "country_iso2": "BE", "purpose": "n/a" },
            { "title": "Congress Newsletter", "slug": "Congress_Newsletter", "type": "online", "opt_type": "single", "category": "mc", "category_title": "Medical Consent", "country_iso2": "BE", "purpose": "n/a" },
            { "title": "Send Email about clinical trial studies", "slug": "Send_Email_about_clinical_trial_studies", "type": "online", "opt_type": "single", "category": "mc", "category_title": "Medical Consent", "country_iso2": "BE", "purpose": "n/a" },
            { "title": "That medical information is shorten for teasering content and better readability", "slug": "That_medical_information_is_shorten_for_teasering_content_and_better_readability", "type": "online", "opt_type": "single", "category": "mc", "category_title": "Medical Consent", "country_iso2": "BE", "purpose": "n/a" },
            { "title": "Send Mode of Action rich media content", "slug": "Send_Mode_of_Action_rich_media_content", "type": "online", "opt_type": "single", "category": "mc", "category_title": "Medical Consent", "country_iso2": "BE", "purpose": "n/a" },
            { "title": "Send e-Detailing aid", "slug": "Send_e-Detailing_aid", "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "BE", "purpose": "n/a" },
            { "title": "Invite to Remote Engagement", "slug": "Invite_to_Remote_Engagement", "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "BE", "purpose": "n/a" },
            { "title": "Send CLM content after RepSale visit", "slug": "Send_CLM_content_after_RepSale_visit", "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "BE", "purpose": "n/a" },
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

    async.waterfall([applicationSeeder, userSeeder, consentSeeder], function (err) {
        if (err) console.error(err);
        else console.info("DB seed completed!");
        process.exit();
    });
}

init();
