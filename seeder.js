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
            { "title": "Sample Request", "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "NL"},
            { "title": "Invite to KOL Webminar", "type": "online", "opt_type": "double", "category": "mc", "category_title": "Medical Consent", "country_iso2": "NL" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt_type": "double", "category": "mc", "category_title": "Medical Consent", "country_iso2": "NL" },
            { "title": "Register to E-mail Newsletter (Mass email)", "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "NL" },
            { "title": "Send congress Agenda via email", "type": "online", "opt_type": "double", "category": "mc", "category_title": "Medical Consent", "country_iso2": "NL" },
            { "title": "Congress Newsletter", "type": "online", "opt_type": "double", "category": "mc", "category_title": "Medical Consent", "country_iso2": "NL" },
            { "title": "Send Email about clinical trial studies", "type": "online", "opt_type": "double", "category": "mc", "category_title": "Medical Consent", "country_iso2": "NL" },
            { "title": "That medical information is shorten for teasering content and better readability", "type": "online", "opt_type": "double", "category": "mc", "category_title": "Medical Consent", "country_iso2": "NL" },
            { "title": "Send Mode of Action rich media content", "type": "online", "opt_type": "double", "category": "mc", "category_title": "Medical Consent", "country_iso2": "NL" },
            { "title": "Send e-Detailing aid", "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "NL" },
            { "title": "Invite to Remote Engagement", "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "NL" },
            { "title": "Send CLM content after RepSale visit", "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "NL" },
        ];

        const convertToSlug = string => string.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-");
        
        const all_consents = consents.map( consent => {
            const slug = convertToSlug(consent.title);
            return { ...consent, slug };
        });

        Consent.destroy({ truncate: true }).then(() => {
            Consent.bulkCreate(all_consents, {
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
