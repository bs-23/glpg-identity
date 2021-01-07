const path = require('path');
const async = require('async');
const util = require('util');
const pg = require('pg');

async function init() {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));

    await config.initEnvironmentVariables();
    const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

    const asyncCreateCDPDevDB = util.promisify(createCDPDevDB)
    await asyncCreateCDPDevDB()

    const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

    await sequelize.cdpConnector.query(`CREATE SCHEMA IF NOT EXISTS ${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`);

    await sequelize.cdpConnector.query(`
        DO $$ BEGIN
        CREATE AGGREGATE array_concat_agg(anyarray) (
            SFUNC = array_cat,
            STYPE = anyarray
        );
        EXCEPTION
            WHEN duplicate_function THEN NULL;
        END $$;
    `);

    const Application = require(path.join(process.cwd(), 'src/modules/platform/application/server/application.model'));
    const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model.js'));
    const ConsentCategory = require(path.join(process.cwd(), 'src/modules/consent/server/consent-category.model'));
    const Consent = require(path.join(process.cwd(), 'src/modules/consent/server/consent.model'));
    const ConsentLocale = require(path.join(process.cwd(), 'src/modules/consent/server/consent-locale.model'));
    const ConsentCountry = require(path.join(process.cwd(), 'src/modules/consent/server/consent-country.model'));
    const UserProfile = require(path.join(process.cwd(), "src/modules/platform/profile/server/user-profile.model.js"));
    const ServiceCategory = require(path.join(process.cwd(), "src/modules/platform/user/server/permission/service-category.model.js"));
    const PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permission-set.model.js"));
    const PermissionSet_ServiceCategory = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permissionSet-serviceCategory.model.js"));
    const PermissionSet_Application = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permissionSet-application.model.js"));
    const UserProfile_PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/userProfile-permissionSet.model.js"));
    const Role = require(path.join(process.cwd(), "src/modules/platform/role/server/role.model.js"));
    const UserRole = require(path.join(process.cwd(), "src/modules/platform/role/server/user-role.model.js"));
    const { Modules } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
    const Faq = require(path.join(process.cwd(), 'src/modules/platform/faq/server/faq.model.js'));
    const ClinicalTrialHistoryModel = require(path.join(process.cwd(), 'src/modules/clinical-trials/server/clinical-trials.history.model.js'));
    const ClinicalTrialTrialModel = require(path.join(process.cwd(), 'src/modules/clinical-trials/server/clinical-trials.trial.model.js'));
    const ClinicalTrialLocationModel = require(path.join(process.cwd(), 'src/modules/clinical-trials/server/clinical-trials.location.model.js'));
    require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.model'));
    require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-profile.model'));
    require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-consents.model'));
    require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-archives.model'));
    require(path.join(process.cwd(), 'src/modules/platform/user/server/reset-password.model.js'));
    require(path.join(process.cwd(), 'src/modules/core/server/password/password-history.model.js'));
    require(path.join(process.cwd(), 'src/modules/platform/application/server/data.model.js'));


    await sequelize.cdpConnector.sync();

    const convertToSlug = string => string.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');



    function userSeeder(callback) {
        User.findOrCreate({
            where: { email: 'glpg@brainstation-23.com' }, defaults: {
                first_name: 'System',
                last_name: 'Admin',
                password: 'P@ssword123',
                type: 'admin'
            }
        }).then(function () {
            callback();
        });
    }



    function userProfileSeeder(callback) {
        User.findOne({ where: { email: 'glpg@brainstation-23.com' } }).then(admin => {

            const userProfiles = [
                { title: "System Admin", slug: "system_admin", type: 'standard', description: "This is the default profile for System Admin", created_by: admin.id, updated_by: admin.id },
                { title: "Site Admin", slug: "site_admin", type: 'standard', description: "This is the default profile for Site Admin", created_by: admin.id, updated_by: admin.id },
                { title: "Global Data Steward", type: 'standard', slug: "global_data_steward", description: "This is the default profile for Global Data Steward", created_by: admin.id, updated_by: admin.id },
                { title: "Local Data Steward", type: 'standard', slug: "local_data_steward", description: "This is the default profile for Local Data Steward", created_by: admin.id, updated_by: admin.id },
                { title: "Data Privacy Officer", type: 'standard', slug: "data_privacy_officer", description: "This is the default profile for Data Privacy Officer", created_by: admin.id, updated_by: admin.id }
            ];

            UserProfile.destroy({ truncate: { cascade: true } }).then(() => {
                UserProfile.bulkCreate(userProfiles, {
                    returning: true,
                    ignoreDuplicates: false
                }).then(function () {
                    callback();
                });
            });
        });
    }


    function userUpdateSeeder(callback) {
        User.findOne({
            where: { email: 'glpg@brainstation-23.com' }
        }).then(admin => {
            UserProfile.findOne({ where: { slug: 'system_admin' } }).then(sysAdminProfile => {
                admin.update({ profileId: sysAdminProfile.id });
            })

        }).then(function () {
            callback();
        });
    }

    function serviceCategorySeeder(callback) {
        User.findOne({ where: { email: 'glpg@brainstation-23.com' } }).then(admin => {

            const serviceCategories = [
                { title: "Management of Customer Data Platform", slug: "platform", created_by: admin.id, updated_by: admin.id },
                { title: "Information Management", slug: "information", created_by: admin.id, updated_by: admin.id },
                { title: "Data Privacy & Consent Management", slug: "privacy", created_by: admin.id, updated_by: admin.id }
            ];

            ServiceCategory.destroy({ truncate: { cascade: true } }).then(() => {
                ServiceCategory.bulkCreate(serviceCategories, {
                    returning: true,
                    ignoreDuplicates: false
                }).then(function () {
                    callback();
                });
            });
        });
    }

    function faqSeeder(callback) {
        User.findOne({ where: { email: 'glpg@brainstation-23.com' } }).then(admin => {

            const faqCategories = [
                { question: "Key Benefits of a CDP", answer: "<p>CDPs improve your organization, better your customer relationships, and complement your current software and marketing efforts. Here are a handful of key benefits of having a CDP.</p>", topics: ["general-information"], created_by: admin.id, updated_by: admin.id },
                { question: "What is customer data?", answer: "<p>CDPs exist because customer data has become crucial to both business and marketing operations. So, what is customer data exactly? Customer data is information consumers leave behind as they use the internet and interact with companies online and offline: through websites, blogs, e-commerce portals, and in-store interactions. (We dive into some examples below.) It’s highly valuable to businesses, although recent legal dialogue (such as the GDPR) has changed how organizations collect and manage this data.</p>", topics: ["general-information"], created_by: admin.id, updated_by: admin.id },
                { question: "What is a Customer Data Platform?", answer: "<p>A Customer Data Platform (CDP) is a software that aggregates and organizes customer data across a variety of touchpoints and is used by other software, systems, and marketing efforts. CDPs collect and structure real-time data into individual, centralized customer profiles.</p>", topics: ["general-information"], created_by: admin.id, updated_by: admin.id },
                { question: "Data Collection", answer: "<p>The main advantage of a CDP is its ability to collect data from a variety of sources (both online and offline, with a variety of formats and structures) and convert that disparate data into a standardized form.</p>", topics: ["general-information"], created_by: admin.id, updated_by: admin.id }
            ];

            Faq.destroy({ truncate: { cascade: true } }).then(() => {
                Faq.bulkCreate(faqCategories, {
                    returning: true,
                    ignoreDuplicates: false
                }).then(function () {
                    callback();
                });
            });
        });
    }

    function permissionSetSeeder(callback) {

        User.findOne({ where: { email: 'glpg@brainstation-23.com' } }).then(admin => {

            const permissionSet = [
                { title: "System Admin Permission Set", slug: "system_admin", type: 'standard', countries: ["BE", "FR", "DE", "IT", "NL", "ES", "GB"], description: "This is the default permission set for System Admin", created_by: admin.id, updated_by: admin.id },
                { title: "Site Admin Permission Set", slug: "site_admin", type: 'standard', description: "This is the default permission set for Site Admin", countries: ["BE", "FR", "DE", "IT", "NL", "ES", "GB"], created_by: admin.id, updated_by: admin.id },
                { title: "GDS Permission Set", slug: "gds", type: 'standard', countries: ["BE", "FR", "DE", "IT", "NL", "ES", "GB"], description: "This is the default permission set for Global Data Steward", created_by: admin.id, updated_by: admin.id },
                { title: "LDS Permission Set", slug: "lds", type: 'standard', description: "This is the default permission set for Local Data Steward", created_by: admin.id, updated_by: admin.id },
                { title: "DPO Permission Set", slug: "data_privacy_officer", type: 'standard', description: "This is the default permission set for Data Privacy Officer", created_by: admin.id, updated_by: admin.id },
            ];

            PermissionSet.destroy({ truncate: { cascade: true } }).then(() => {
                PermissionSet.bulkCreate(permissionSet, {
                    returning: true,
                    ignoreDuplicates: false
                }).then(function () {
                    callback();
                });
            });
        });
    }

    function permissionSetServiceCategorySeeder(callback) {
        User.findOne({ where: { email: 'glpg@brainstation-23.com' } }).then(admin => {
            const systemAdmin_permissionSet = PermissionSet.findOne({ where: { slug: 'system_admin' } });
            const siteAdmin_permissionSet = PermissionSet.findOne({ where: { slug: 'site_admin' } });
            const hcpServiceCategory = ServiceCategory.findOne({ where: { slug: 'information' } });
            const userServiceCategory = ServiceCategory.findOne({ where: { slug: 'platform' } });
            const consentServiceCategory = ServiceCategory.findOne({ where: { slug: 'privacy' } });
            const dpo_permissionSet = PermissionSet.findOne({ where: { slug: 'data_privacy_officer' } });
            const gds_permissionSet = PermissionSet.findOne({ where: { slug: 'gds' } });
            const lds_permissionSet = PermissionSet.findOne({ where: { slug: 'lds' } });

            Promise.all([systemAdmin_permissionSet, siteAdmin_permissionSet, hcpServiceCategory, userServiceCategory, consentServiceCategory, dpo_permissionSet, gds_permissionSet, lds_permissionSet]).then((values) => {
                const permissionSet_serviceCategory = [
                    { permissionSetId: values[0].id, serviceCategoryId: values[2].id },
                    { permissionSetId: values[0].id, serviceCategoryId: values[3].id },
                    { permissionSetId: values[0].id, serviceCategoryId: values[4].id },

                    { permissionSetId: values[1].id, serviceCategoryId: values[2].id },
                    { permissionSetId: values[1].id, serviceCategoryId: values[3].id },
                    { permissionSetId: values[1].id, serviceCategoryId: values[4].id },

                    { permissionSetId: values[5].id, serviceCategoryId: values[4].id },

                    { permissionSetId: values[6].id, serviceCategoryId: values[2].id },
                    { permissionSetId: values[7].id, serviceCategoryId: values[2].id }
                ];

                PermissionSet_ServiceCategory.destroy({ truncate: { cascade: true } }).then(() => {
                    PermissionSet_ServiceCategory.bulkCreate(permissionSet_serviceCategory, {
                        returning: true,
                        ignoreDuplicates: false
                    }).then(function () {
                        callback();
                    });
                });
            });

        });
    }

    function userProfilePermissionSetSeeder(callback) {

        const systemAdminProfile = UserProfile.findOne({ where: { slug: 'system_admin' } });
        const systemAdminPermissionSet = PermissionSet.findOne({ where: { slug: 'system_admin' } });
        const sitedminProfile = UserProfile.findOne({ where: { slug: 'site_admin' } });
        const siteAdminPermissionSet = PermissionSet.findOne({ where: { slug: 'site_admin' } });
        const gdsPermissionSet = PermissionSet.findOne({ where: { slug: 'gds' } });
        const gdsProfile = UserProfile.findOne({ where: { slug: 'global_data_steward' } });
        const dpoProfile = UserProfile.findOne({ where: { slug: 'data_privacy_officer' } });
        const dpoPermissionSet = PermissionSet.findOne({ where: { slug: 'data_privacy_officer' } });
        const ldsProfile = UserProfile.findOne({ where: { slug: 'local_data_steward' } });
        const ldsPermissionSet = PermissionSet.findOne({ where: { slug: 'lds' } });

        Promise.all([systemAdminProfile, systemAdminPermissionSet, sitedminProfile, siteAdminPermissionSet, gdsProfile, gdsPermissionSet, dpoProfile, dpoPermissionSet, ldsProfile, ldsPermissionSet]).then((values) => {
            const userprofile_permissionSet = [
                { userProfileId: values[0].id, permissionSetId: values[1].id },
                { userProfileId: values[2].id, permissionSetId: values[3].id },
                { userProfileId: values[6].id, permissionSetId: values[7].id },
                { userProfileId: values[4].id, permissionSetId: values[5].id },
                { userProfileId: values[8].id, permissionSetId: values[9].id }
            ];

            UserProfile_PermissionSet.destroy({ truncate: { cascade: true } }).then(() => {
                UserProfile_PermissionSet.bulkCreate(userprofile_permissionSet, {
                    returning: true,
                    ignoreDuplicates: false
                }).then(function () {
                    callback();
                });
            });
        });

    }

    function applicationSeeder(callback) {
        User.findOne({ where: { email: 'glpg@brainstation-23.com' } }).then(admin => {
            const applications = [
                {
                    id: '3252888b-530a-441b-8358-3e423dbce08a',
                    name: 'HCP Portal',
                    slug: convertToSlug('HCP Portal'),
                    email: 'hcp-portal@glpg.com',
                    password: 'P@ssword123',
                    approve_user_path: '/bin/public/glpg-brandx/mail/approve-user',
                    auth_secret: 'd9ce7267-bb4e-4e3f-8901-ff28b8ad7e6a',
                    logo_link: `${nodecache.getValue('S3_BUCKET_URL')}/hcp-portal/logo.png`,
                    created_by: admin.id,
                    updated_by: admin.id
                },
                {
                    id: 'a7959308-7ec5-4090-94ff-2367113a454d',
                    name: 'Jyseleca',
                    slug: convertToSlug('Jyseleca'),
                    email: 'jyseleca@glpg.com',
                    password: 'P@ssword123',
                    approve_user_path: '/bin/public/glpg-brandx/mail/approve-user',
                    auth_secret: 'd9ce7267-bb4e-4e3f-8901-ff28b8ad7e6a',
                    logo_link: `${nodecache.getValue('S3_BUCKET_URL')}/jyseleca/logo.png`,
                    created_by: admin.id,
                    updated_by: admin.id
                },
                {
                    id: '0da54f98-6ec0-4055-8ce7-4ab2aa1fe921',
                    name: 'Clinical Trials',
                    slug: convertToSlug('Clinical Trials'),
                    email: 'clinical-trial-portal@glpg.com',
                    password: 'P@ssword123',
                    approve_user_path: '/bin/public/glpg-brandx/mail/approve-user',
                    auth_secret: 'd9ce7267-bb4e-4e3f-8901-ff28b8ad7e6a',
                    logo_link: `${nodecache.getValue('S3_BUCKET_URL')}/hcp-portal/logo.png`,
                    created_by: admin.id,
                    updated_by: admin.id
                }
            ];

            Application.destroy({ truncate: { cascade: true } }).then(() => {
                Application.bulkCreate(applications, {
                    returning: true,
                    ignoreDuplicates: false
                }).then(function () {
                    callback();
                });
            });
        });
    }

    function permissionSetApplicationsSeeder(callback) {
        User.findOne({ where: { email: 'glpg@brainstation-23.com' } }).then(admin => {
            const systemAdmin_permissionSet = PermissionSet.findOne({ where: { slug: 'system_admin' } });
            const jyselecaApplication = Application.findOne({ where: { slug: 'jyseleca' } });
            const hcpPortalApplication = Application.findOne({ where: { slug: 'hcp-portal' } });

            Promise.all([systemAdmin_permissionSet, jyselecaApplication, hcpPortalApplication]).then((values) => {
                const permissionSet_applications = [
                    { permissionSetId: values[0].id, applicationId: values[1].id },
                    { permissionSetId: values[0].id, applicationId: values[2].id },
                ];

                PermissionSet_Application.destroy({ truncate: { cascade: true } }).then(() => {
                    PermissionSet_Application.bulkCreate(permissionSet_applications, {
                        returning: true,
                        ignoreDuplicates: false
                    }).then(function () {
                        callback();
                    });
                });
            });

        });
    }

    function consentSeeder(callback) {
        User.findOne({ where: { email: 'glpg@brainstation-23.com' } }).then(admin => {
            const consent_categories = [
                { id: 'fe037405-c676-4d98-bd05-85008900c838', title: 'Direct Marketing', type: 'dm', slug: '', created_by: admin.id },
                { id: '29374bce-7c3f-4408-a138-c062143d2247', title: 'Medical Consent', type: 'mc', slug: '', created_by: admin.id },
                { id: '59953d51-2449-4b65-950f-9f88654019bb', title: 'General Consent', type: 'general', slug: '', created_by: admin.id }
            ];

            const consents = [
                {
                    id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
                    category_id: '59953d51-2449-4b65-950f-9f88654019bb',
                    legal_basis: 'consent',
                    preference: 'Galapagos Terms of Use',
                    slug: '',
                    is_active: true,
                    created_by: admin.id,
                    updated_by: admin.id
                },
                {
                    id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                    category_id: 'fe037405-c676-4d98-bd05-85008900c838',
                    legal_basis: 'consent',
                    preference: 'Galapagos E-Mail Newsletter',
                    slug: '',
                    is_active: true,
                    created_by: admin.id,
                    updated_by: admin.id
                },
                {
                    id: '2b9fa7f9-2c1e-4621-a091-5e4bf539b875',
                    category_id: '59953d51-2449-4b65-950f-9f88654019bb',
                    legal_basis: 'consent',
                    preference: 'Sharing Personal Data With 3rd Parties',
                    slug: '',
                    is_active: true,
                    created_by: admin.id,
                    updated_by: admin.id
                }
            ];

            const consentLocales = [
                {
                    rich_text: "<p>Ce site est strictement destiné aux médecins et non aux infirmie(è)r(es) et / ou au grand public. Vous déclarez explicitement être médecin au sens de l'article 3 de la loi sur l’art de guérir.</p>",
                    consent_id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
                    locale: 'fr_BE'
                },
                {
                    rich_text: "<p>Vous déclarez que les données saisies sont vos données personnelles et que les informations sont complètes et exactes. En aucun cas, vos données ne peuvent être partagées avec des tiers pour permettre à ces tiers d'accéder au présent site. Vous devez immédiatement informer Galapagos de toute utilisation non autorisée connue ou soupçonnée de vos informations personnelles dans le cadre de l'accès à ce site.</p>",
                    consent_id: '2b9fa7f9-2c1e-4621-a091-5e4bf539b875',
                    locale: 'fr_BE'
                },
                {
                    rich_text: "<p>Je consens à ce que Galapagos m'envoie des informations promotionnelles et environnementales concernant tous les produits et services de Galapagos à l'adresse mail que j'ai fournie. <br> <br> Pour obtenir de plus amples informations sur la manière dont nous traitons vos données à caractère personnel, veuillez vous référer à notre <a href='https://www.glpg.com/belgique/fr-politique-de-confidentialite' target='_blank'>Déclaration de confidentialité</a>.</p>",
                    consent_id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                    locale: 'fr_BE'
                },
                {
                    rich_text: "<p>Deze website is strikt bedoeld voor geneesheren en niet voor verpleegkundigen en/of het grote publiek. U verklaart uitdrukkelijk dat u een geneesheer bent in de zin van artikel 3 van de wet betreffende de uitoefening van de gezondheidszorgberoepen.</p>",
                    consent_id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
                    locale: 'nl_BE'
                },
                {
                    rich_text: "<p>U verklaart dat de ingevulde gegevens uw persoonlijke gegevens zijn en dat de informatie volledig en accuraat is. Uw gegevens mogen in geen geval gedeeld worden met derden om die derden toegang te verlenen aan huidige website. U moet Galapagos onmiddellijk op de hoogte brengen van elk bekend of vermoeden van niet-geautoriseerd gebruik van uw persoonlijke gegevens inzake de toegang tot deze website.</p>",
                    consent_id: '2b9fa7f9-2c1e-4621-a091-5e4bf539b875',
                    locale: 'nl_BE'
                },
                {
                    rich_text: "<p>Ik ontvang graag informatieve en promotionele communicatie via e-mail over de producten, diensten en andere ontwikkelingen van Galapagos. <br> <br> Raadpleeg onze <a href='https://www.glpg.com/belgie/privacyverklaring' target='_blank'>privacyverklaring</a> voor meer informatie over hoe we met uw persoonsgegevens omgaan.</p>",
                    consent_id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                    locale: 'nl_BE'
                },
                {
                    rich_text: "<p>Ik bevestig dat ik een professionele zorgverlener ben die in Nederland werkzaam is en ik accepteer de <a href='https://www.glpg.com/nederland/disclaimer' target='_blank'>Gebruiksvoorwaarden</a> van Galapagos.nl.</p>",
                    consent_id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
                    locale: 'nl_NL'
                },
                {
                    rich_text: "<p>Ik verklaar dat de ingevulde gegevens mijn persoonlijke gegevens zijn en dat de informatie volledig en accuraat is. Ik verklaar dat ik mijn gegevens niet zal delen met derden om die derden toegang te verlenen tot de huidige website. Ik zal Galapagos onmiddellijk op de hoogte brengen van elk bekend of vermoed niet-geautoriseerd gebruik van mijn persoonlijke gegevens inzake de toegang tot deze website.</p>",
                    consent_id: '2b9fa7f9-2c1e-4621-a091-5e4bf539b875',
                    locale: 'nl_NL'
                },
                {
                    rich_text: "<p>Ik ontvang graag informatieve en promotionele communicatie via e-mail over de producten, diensten en andere ontwikkelingen van Galapagos. <br> <br> Raadpleeg onze <a href='https://www.glpg.com/nederland/privacyverklaring' target='_blank'>privacyverklaring</a> voor meer informatie over hoe we met uw persoonsgegevens omgaan.</p>",
                    consent_id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                    locale: 'nl_NL'
                }
            ];

            const consentCountries = [
                {
                    consent_id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
                    country_iso2: 'be',
                    opt_type: 'single-opt-in'
                },
                {
                    consent_id: '2b9fa7f9-2c1e-4621-a091-5e4bf539b875',
                    country_iso2: 'be',
                    opt_type: 'single-opt-in'
                },
                {
                    consent_id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                    country_iso2: 'be',
                    opt_type: 'single-opt-in'
                },
                {
                    consent_id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
                    country_iso2: 'nl',
                    opt_type: 'single-opt-in'
                },
                {
                    consent_id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                    country_iso2: 'nl',
                    opt_type: 'single-opt-in'
                },
                {
                    consent_id: '2b9fa7f9-2c1e-4621-a091-5e4bf539b875',
                    country_iso2: 'nl',
                    opt_type: 'single-opt-in'
                }
            ];

            Consent.destroy({
                where: {},
                include: [{ model: ConsentCategory }]
            }).then(() => {
                ConsentCategory.bulkCreate(consent_categories, {
                    returning: true,
                    ignoreDuplicates: false
                }).then(function () {
                    Consent.bulkCreate(consents, {
                        returning: true,
                        ignoreDuplicates: false
                    }).then(function () {
                        ConsentLocale.bulkCreate(consentLocales, {
                            returning: true,
                            ignoreDuplicates: false
                        }).then(function () {
                            ConsentCountry.bulkCreate(consentCountries, {
                                returning: true,
                                ignoreDuplicates: false
                            }).then(function () {
                                callback();
                            });
                        });
                    });
                });
            });
        });
    }
    function createDB(callback, connection, dbname){
        let cs = `${connection}/postgres`;
        const client = new pg.Client(cs);
        client.connect();
        client.query(`CREATE DATABASE "${dbname}"`).then(res => {
            client.end();
            callback();
        });
    }

    function createCDPDevDB(callback){
        createDB(callback, nodecache.getValue('POSTGRES_CLINICAL_TRIALS_URL'), nodecache.getValue('POSTGRES_CDP_DATABASE'))
    }

    function createClinicalTrialsDevDB(callback){
        createDB(callback, nodecache.getValue('POSTGRES_CLINICAL_TRIALS_URL'), nodecache.getValue('POSTGRES_CLINICAL_TRIALS_DATABASE'))
    }
    async function clinicalTrilalsDbStructureSeeder(callback){
        let clinicalTrialsDBCreated = x => {
            console.log("Clinical Trials DB Created");
        }
        let asyncCreateClinicalTrialsDevDB = util.promisify(createClinicalTrialsDevDB);
        await asyncCreateClinicalTrialsDevDB();
        await sequelize.clinitalTrialsConnector.query(`CREATE SCHEMA IF NOT EXISTS "${nodecache.getValue('POSTGRES_CLINICAL_TRIALS_SCHEMA')}"`);
        await sequelize.clinitalTrialsConnector.sync();
    }


    function clinicalTrialsDbDummyDataSeeder(callback){
        User.findOne({ where: { email: 'glpg@brainstation-23.com' } }).then(admin => {

            ClinicalTrialHistoryModel.bulkCreate([
                {
                    description: "initial history entry",
                    value: `{"FullStudiesResponse":{"APIVrs":"1.01.02","DataVrs":"2020:12:29 22:25:29.063","Expression":"SEARCH[Study](AREA[OrgFullName]Gilead)","NStudiesAvail":362413,"NStudiesFound":523,"MinRank":501,"MaxRank":501,"NStudiesReturned":1,"FullStudies":[{"Rank":501,"Study":{"ProtocolSection":{"IdentificationModule":{"NCTId":"NCT00208312","OrgStudyIdInfo":{"OrgStudyId":"CVT 5132"},"Organization":{"OrgFullName":"Gilead Sciences","OrgClass":"INDUSTRY"},"BriefTitle":"ADVANCE MPI 2: Study of Regadenoson Versus Adenoscan® in Patients Undergoing Myocardial Perfusion Imaging (MPI)","OfficialTitle":"A Phase III, Randomized, Double-Blind Study of Intravenous CVT-3146 Versus Adenoscan® in Patients Undergoing Stress Myocardial Perfusion Imaging"},"StatusModule":{"StatusVerifiedDate":"November 2009","OverallStatus":"Completed","ExpandedAccessInfo":{"HasExpandedAccess":"No"},"StartDateStruct":{"StartDate":"April 2004"},"PrimaryCompletionDateStruct":{"PrimaryCompletionDate":"June 2005","PrimaryCompletionDateType":"Actual"},"CompletionDateStruct":{"CompletionDate":"June 2005","CompletionDateType":"Actual"},"StudyFirstSubmitDate":"September 13, 2005","StudyFirstSubmitQCDate":"September 13, 2005","StudyFirstPostDateStruct":{"StudyFirstPostDate":"September 21, 2005","StudyFirstPostDateType":"Estimate"},"LastUpdateSubmitDate":"November 24, 2009","LastUpdatePostDateStruct":{"LastUpdatePostDate":"November 26, 2009","LastUpdatePostDateType":"Estimate"}},"SponsorCollaboratorsModule":{"ResponsibleParty":{"ResponsiblePartyOldNameTitle":"Philip Sager, Vice President, Clinical Research","ResponsiblePartyOldOrganization":"Gilead Sciences"},"LeadSponsor":{"LeadSponsorName":"Gilead Sciences","LeadSponsorClass":"INDUSTRY"},"CollaboratorList":{"Collaborator":[{"CollaboratorName":"Astellas Pharma US, Inc.","CollaboratorClass":"INDUSTRY"}]}},"OversightModule":{"OversightHasDMC":"No"},"DescriptionModule":{"BriefSummary":"Adenoscan® (adenosine) is an approved pharmacological stress agent indicated as an adjunct to thallium-201 myocardial perfusion scintigraphy in patients unable to exercise adequately. The investigational drug, regadenoson (CVT-3146) is a selective A2A adenosine receptor agonist, the receptor responsible for coronary vasodilation, and is being studied for potential use as a pharmacologic stress agent in myocardial perfusion imaging (MPI) studies. This study will compare the safety and efficacy of regadenoson to that of Adenoscan in detecting reversible myocardial perfusion defects.","DetailedDescription":"ADVANCE MPI 2 is a multi-national, double-blind, randomized, active-controlled, parallel group clinical trial to evaluate the safety and efficacy of regadenoson in SPECT MPI compared to that of the approved pharmacological stress agent, Adenoscan. Patients referred for a clinically indicated pharmacological stress MPI study will be eligible for enrollment. The trial is designed: (1) to compare the pharmacological stress SPECT images obtained with regadenoson to those obtained with Adenoscan, and (2) to compare the safety and tolerability of the two stress agents."},"ConditionsModule":{"ConditionList":{"Condition":["Coronary Artery Disease"]},"KeywordList":{"Keyword":["Lexiscan","Regadenoson","Adenoscan®","Adenosine","SPECT Myocardial Perfusion Imaging","Reversible Perfusion Defect"]}},"DesignModule":{"StudyType":"Interventional","PhaseList":{"Phase":["Phase 3"]},"DesignInfo":{"DesignAllocation":"Randomized","DesignInterventionModel":"Parallel Assignment","DesignPrimaryPurpose":"Diagnostic","DesignMaskingInfo":{"DesignMasking":"Quadruple","DesignWhoMaskedList":{"DesignWhoMasked":["Participant","Care Provider","Investigator","Outcomes Assessor"]}}},"EnrollmentInfo":{"EnrollmentCount":"787","EnrollmentType":"Actual"}},"ArmsInterventionsModule":{"ArmGroupList":{"ArmGroup":[{"ArmGroupLabel":"1","ArmGroupType":"Experimental","ArmGroupDescription":"Regadenoson","ArmGroupInterventionList":{"ArmGroupInterventionName":["Drug: Regadenoson"]}},{"ArmGroupLabel":"2","ArmGroupType":"Active Comparator","ArmGroupDescription":"Adenoscan","ArmGroupInterventionList":{"ArmGroupInterventionName":["Drug: Adenosine"]}}]},"InterventionList":{"Intervention":[{"InterventionType":"Drug","InterventionName":"Regadenoson","InterventionDescription":"0.4 mg, bolus intravenous injection","InterventionArmGroupLabelList":{"InterventionArmGroupLabel":["1"]},"InterventionOtherNameList":{"InterventionOtherName":["Lexiscan","CVT-3146"]}},{"InterventionType":"Drug","InterventionName":"Adenosine","InterventionDescription":"0.14 mg/kg/min for 6 minutes, intravenous infusion","InterventionArmGroupLabelList":{"InterventionArmGroupLabel":["2"]},"InterventionOtherNameList":{"InterventionOtherName":["Adenoscan"]}}]}},"OutcomesModule":{"PrimaryOutcomeList":{"PrimaryOutcome":[{"PrimaryOutcomeMeasure":"Non-inferiority of regadenoson to Adenoscan for use in SPECT myocardial perfusion imaging in assessing reversible perfusion defects","PrimaryOutcomeTimeFrame":"After radiopharmaceutical administration"}]},"SecondaryOutcomeList":{"SecondaryOutcome":[{"SecondaryOutcomeMeasure":"Safety and tolerability comparison of regadenoson to Adenoscan","SecondaryOutcomeTimeFrame":"Up to two weeks"},{"SecondaryOutcomeMeasure":"Additional comparisons of images obtained with regadenoson to those obtained with Adenoscan","SecondaryOutcomeTimeFrame":"After radiopharmaceutical administration"}]}},"EligibilityModule":{"EligibilityCriteria":"Inclusion Criteria:\n\nReferred for a clinically indicated pharmacological stress SPECT myocardial perfusion imaging study\n\nExclusion Criteria:\n\nAny condition precluding the safe administration of Adenoscan for a SPECT myocardial perfusion imaging study\nPregnant or breast-feeding, or (if pre-menopausal), not practicing acceptable method of birth control","HealthyVolunteers":"No","Gender":"All","MinimumAge":"18 Years","StdAgeList":{"StdAge":["Adult","Older Adult"]}},"ContactsLocationsModule":{"LocationList":{"Location":[{"LocationFacility":"Multiple study locations (see Central Contact); CV Therapeutics, Inc.","LocationCity":"Palo Alto","LocationState":"California","LocationZip":"94304","LocationCountry":"United States"}]}},"ReferencesModule":{"ReferenceList":{"Reference":[{"ReferencePMID":"17826318","ReferenceType":"result","ReferenceCitation":"Iskandrian AE, Bateman TM, Belardinelli L, Blackburn B, Cerqueira MD, Hendel RC, Lieu H, Mahmarian JJ, Olmsted A, Underwood SR, Vitola J, Wang W; ADVANCE MPI Investigators. Adenosine versus regadenoson comparative evaluation in myocardial perfusion imaging: results of the ADVANCE phase 3 multicenter international trial. J Nucl Cardiol. 2007 Sep-Oct;14(5):645-58."}]},"SeeAlsoLinkList":{"SeeAlsoLink":[{"SeeAlsoLinkLabel":"Adenoscan®","SeeAlsoLinkURL":"http://www.adenoscan.com"}]}}},"DerivedSection":{"MiscInfoModule":{"VersionHolder":"December 30, 2020"},"ConditionBrowseModule":{"ConditionMeshList":{"ConditionMesh":[{"ConditionMeshId":"D000003324","ConditionMeshTerm":"Coronary Artery Disease"}]},"ConditionAncestorList":{"ConditionAncestor":[{"ConditionAncestorId":"D000003327","ConditionAncestorTerm":"Coronary Disease"},{"ConditionAncestorId":"D000017202","ConditionAncestorTerm":"Myocardial Ischemia"},{"ConditionAncestorId":"D000006331","ConditionAncestorTerm":"Heart Diseases"},{"ConditionAncestorId":"D000002318","ConditionAncestorTerm":"Cardiovascular Diseases"},{"ConditionAncestorId":"D000001161","ConditionAncestorTerm":"Arteriosclerosis"},{"ConditionAncestorId":"D000001157","ConditionAncestorTerm":"Arterial Occlusive Diseases"},{"ConditionAncestorId":"D000014652","ConditionAncestorTerm":"Vascular Diseases"}]},"ConditionBrowseLeafList":{"ConditionBrowseLeaf":[{"ConditionBrowseLeafId":"M5129","ConditionBrowseLeafName":"Coronary Artery Disease","ConditionBrowseLeafAsFound":"Coronary Artery Disease","ConditionBrowseLeafRelevance":"high"},{"ConditionBrowseLeafId":"M18089","ConditionBrowseLeafName":"Myocardial Ischemia","ConditionBrowseLeafRelevance":"low"},{"ConditionBrowseLeafId":"M5132","ConditionBrowseLeafName":"Coronary Disease","ConditionBrowseLeafRelevance":"low"},{"ConditionBrowseLeafId":"M9126","ConditionBrowseLeafName":"Ischemia","ConditionBrowseLeafRelevance":"low"},{"ConditionBrowseLeafId":"M8002","ConditionBrowseLeafName":"Heart Diseases","ConditionBrowseLeafRelevance":"low"},{"ConditionBrowseLeafId":"M3050","ConditionBrowseLeafName":"Arteriosclerosis","ConditionBrowseLeafRelevance":"low"},{"ConditionBrowseLeafId":"M3046","ConditionBrowseLeafName":"Arterial Occlusive Diseases","ConditionBrowseLeafRelevance":"low"},{"ConditionBrowseLeafId":"M15983","ConditionBrowseLeafName":"Vascular Diseases","ConditionBrowseLeafRelevance":"low"}]},"ConditionBrowseBranchList":{"ConditionBrowseBranch":[{"ConditionBrowseBranchAbbrev":"BC14","ConditionBrowseBranchName":"Heart and Blood Diseases"},{"ConditionBrowseBranchAbbrev":"All","ConditionBrowseBranchName":"All Conditions"},{"ConditionBrowseBranchAbbrev":"BC23","ConditionBrowseBranchName":"Symptoms and General Pathology"}]}},"InterventionBrowseModule":{"InterventionMeshList":{"InterventionMesh":[{"InterventionMeshId":"D000000241","InterventionMeshTerm":"Adenosine"},{"InterventionMeshId":"C000430916","InterventionMeshTerm":"Regadenoson"}]},"InterventionAncestorList":{"InterventionAncestor":[{"InterventionAncestorId":"D000000700","InterventionAncestorTerm":"Analgesics"},{"InterventionAncestorId":"D000018689","InterventionAncestorTerm":"Sensory System Agents"},{"InterventionAncestorId":"D000018373","InterventionAncestorTerm":"Peripheral Nervous System Agents"},{"InterventionAncestorId":"D000045505","InterventionAncestorTerm":"Physiological Effects of Drugs"},{"InterventionAncestorId":"D000000889","InterventionAncestorTerm":"Anti-Arrhythmia Agents"},{"InterventionAncestorId":"D000014665","InterventionAncestorTerm":"Vasodilator Agents"},{"InterventionAncestorId":"D000058906","InterventionAncestorTerm":"Purinergic P1 Receptor Agonists"},{"InterventionAncestorId":"D000058913","InterventionAncestorTerm":"Purinergic Agonists"},{"InterventionAncestorId":"D000058905","InterventionAncestorTerm":"Purinergic Agents"},{"InterventionAncestorId":"D000018377","InterventionAncestorTerm":"Neurotransmitter Agents"},{"InterventionAncestorId":"D000045504","InterventionAncestorTerm":"Molecular Mechanisms of Pharmacological Action"},{"InterventionAncestorId":"D000058908","InterventionAncestorTerm":"Adenosine A2 Receptor Agonists"}]},"InterventionBrowseLeafList":{"InterventionBrowseLeaf":[{"InterventionBrowseLeafId":"M2176","InterventionBrowseLeafName":"Adenosine","InterventionBrowseLeafAsFound":"Anti-inflammatory","InterventionBrowseLeafRelevance":"high"},{"InterventionBrowseLeafId":"M235125","InterventionBrowseLeafName":"Regadenoson","InterventionBrowseLeafAsFound":"Myopia","InterventionBrowseLeafRelevance":"high"},{"InterventionBrowseLeafId":"M2613","InterventionBrowseLeafName":"Analgesics","InterventionBrowseLeafRelevance":"low"},{"InterventionBrowseLeafId":"M2794","InterventionBrowseLeafName":"Anti-Arrhythmia Agents","InterventionBrowseLeafRelevance":"low"},{"InterventionBrowseLeafId":"M15995","InterventionBrowseLeafName":"Vasodilator Agents","InterventionBrowseLeafRelevance":"low"},{"InterventionBrowseLeafId":"M19088","InterventionBrowseLeafName":"Neurotransmitter Agents","InterventionBrowseLeafRelevance":"low"}]},"InterventionBrowseBranchList":{"InterventionBrowseBranch":[{"InterventionBrowseBranchAbbrev":"AnArAg","InterventionBrowseBranchName":"Anti-Arrhythmia Agents"},{"InterventionBrowseBranchAbbrev":"VaDiAg","InterventionBrowseBranchName":"Vasodilator Agents"},{"InterventionBrowseBranchAbbrev":"Analg","InterventionBrowseBranchName":"Analgesics"},{"InterventionBrowseBranchAbbrev":"All","InterventionBrowseBranchName":"All Drugs and Chemicals"}]}}}}}]}}`,
                    created_by: admin.id,
                    updated_by: admin.id
                }
            ], {
                returning: true,
                ignoreDuplicates: false
            });

            ClinicalTrialLocationModel.bulkCreate([
                {
                    LocationFacility: "facility",
                    LocationCity: 'test city',
                    LocationZip: '12721',
                    LocationCountry: 'TestCountry',
                    lat: 17.669,
                    long: 23.000
                }
            ], {
                returning: true,
                ignoreDuplicates: false
            }).then(location=>{
                // ClinicalTrialTrialModel.bulkCreate([
                //     {
                //     rank: 1,
                //     protocolNumber: 'test city',
                //     govIdentifier: '12721',
                //     clinicalTrialPurpose: 'test country',
                //     clinicalTrialSummary: 'test summary',
                //     gender: 'Male',
                //     minAge: "17 years",
                //     maxAge: "50 years",
                //     stdAge: ["Adult"],
                //     phase: ["phase 1"],
                //     trialStatus: "recruiting",
                //     clinicalTrialSummary: "trial summary",
                //     created_by: req.user.id,
                //     updated_by: req.user.id,
                //     dummy: "dum dum dymmt"
                // }
                // ], {
                //     returning: true,
                //     ignoreDuplicates: false
                // }).then(location=>{
    
                // });
            });
        }).then(function(){
            
        });

        

    }

    async.waterfall([
        userSeeder, 
        userProfileSeeder, 
        faqSeeder, 
        userUpdateSeeder, 
        serviceCategorySeeder, 
        permissionSetSeeder, 
        permissionSetServiceCategorySeeder, 
        userProfilePermissionSetSeeder, 
        applicationSeeder, 
        permissionSetApplicationsSeeder, 
        consentSeeder, 
        clinicalTrilalsDbStructureSeeder,
        clinicalTrialsDbDummyDataSeeder], function (err) {
        if (err) console.error(err);
        else console.info('DB seed completed!');
        process.exit();
    });
}

init();
