const path = require('path');
const async = require('async');
const uniqueSlug = require('unique-slug');

const convertToSlug = string => string.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

const makeCustomSlug = (title) => {
    const code = uniqueSlug(`${title}`);
    if (title.length > 50) return convertToSlug(`${title.substring(0, 50)} ${code}`);
    return convertToSlug(`${title} ${code}`);
};

async function init() {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));

    await config.initEnvironmentVariables();
    const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

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
    const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model'));
    const ConsentCategory = require(path.join(process.cwd(), 'src/modules/privacy/consent-category/server/consent-category.model'));
    const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model.js'));
    const ConsentLocale = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent-locale.model.js'));
    const ConsentCountry = require(path.join(process.cwd(), 'src/modules/privacy/consent-country/server/consent-country.model.js'));
    const UserProfile = require(path.join(process.cwd(), "src/modules/platform/profile/server/user-profile.model"));
    const ServiceCategory = require(path.join(process.cwd(), "src/modules/platform/user/server/permission/service-category.model"));
    const PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permission-set.model"));
    const PermissionSet_ServiceCategory = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permissionSet-serviceCategory.model"));
    const PermissionSet_Application = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permissionSet-application.model"));
    const UserProfile_PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/userProfile-permissionSet.model"));
    require(path.join(process.cwd(), "src/modules/platform/role/server/role.model"));
    require(path.join(process.cwd(), "src/modules/platform/role/server/user-role.model"));
    require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
    const Faq = require(path.join(process.cwd(), 'src/modules/platform/faq/server/faq.model'));
    require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.model'));
    require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-profile.model'));
    require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-consents.model'));
    require(path.join(process.cwd(), 'src/modules/platform/user/server/reset-password.model'));
    require(path.join(process.cwd(), 'src/modules/core/server/password/password-history.model'));
    require(path.join(process.cwd(), 'src/modules/core/server/filter/filter.model'));
    require(path.join(process.cwd(), 'src/modules/platform/application/server/data.model'));
    require(path.join(process.cwd(), 'src/modules/core/server/archive/archive.model'));

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
            });
        }).then(function () {
            callback();
        });
    }

    function serviceCategorySeeder(callback) {
        User.findOne({ where: { email: 'glpg@brainstation-23.com' } }).then(admin => {
            const serviceCategories = [
                { title: "Management of Customer Data Platform", slug: "platform", created_by: admin.id, updated_by: admin.id },
                { title: "Information Management", slug: "information", created_by: admin.id, updated_by: admin.id },
                { title: "Data Privacy & Consent Management", slug: "privacy", created_by: admin.id, updated_by: admin.id },
                { title: "Business Partner Management", slug: "business-partner", created_by: admin.id, updated_by: admin.id },
                { title: "Clinical Trials Management", slug: "clinical-trials", created_by: admin.id, updated_by: admin.id }
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
                { question: "What is customer data?", answer: "<p>CDPs exist because customer data has become crucial to both business and marketing operations. So, what is customer data exactly? Customer data is information consumers leave behind as they use the internet and interact with companies online and offline: through websites, blogs, e-commerce portals, and in-store interactions. (We dive into some examples below.) It???s highly valuable to businesses, although recent legal dialogue (such as the GDPR) has changed how organizations collect and manage this data.</p>", topics: ["general-information"], created_by: admin.id, updated_by: admin.id },
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
            const businessPartnerServiceCategory = ServiceCategory.findOne({ where: { slug: 'clinical-trials' } });
            const dpo_permissionSet = PermissionSet.findOne({ where: { slug: 'data_privacy_officer' } });
            const gds_permissionSet = PermissionSet.findOne({ where: { slug: 'gds' } });
            const lds_permissionSet = PermissionSet.findOne({ where: { slug: 'lds' } });

            Promise.all([systemAdmin_permissionSet, siteAdmin_permissionSet, hcpServiceCategory, userServiceCategory, consentServiceCategory, dpo_permissionSet, gds_permissionSet, lds_permissionSet, businessPartnerServiceCategory]).then((values) => {
                const permissionSet_serviceCategory = [
                    { permissionSetId: values[0].id, serviceCategoryId: values[2].id },
                    { permissionSetId: values[0].id, serviceCategoryId: values[3].id },
                    { permissionSetId: values[0].id, serviceCategoryId: values[4].id },
                    { permissionSetId: values[0].id, serviceCategoryId: values[8].id },

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
                    metadata: JSON.stringify({
                        cache_clearing_url: "https://gwcm-dev.glpg.com/bin/public/glpg-hcpportal/clear/author-publish-cache"
                    }),
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
                    metadata: JSON.stringify({
                        cache_clearing_url: "https://gwcm-dev.glpg.com/bin/public/glpg-brandx/clear/author-publish-cache"
                    }),
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
                { id: 'fe037405-c676-4d98-bd05-85008900c838', title: 'Direct Marketing', type: 'dm', slug: convertToSlug('Direct Marketing'), created_by: admin.id },
                { id: '29374bce-7c3f-4408-a138-c062143d2247', title: 'Medical Consent', type: 'mc', slug: convertToSlug('Medical Consent'), created_by: admin.id },
                { id: '59953d51-2449-4b65-950f-9f88654019bb', title: 'General Consent', type: 'general', slug: convertToSlug('General Consent'), created_by: admin.id }
            ];

            const consents = [
                {
                    id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
                    category_id: '59953d51-2449-4b65-950f-9f88654019bb',
                    legal_basis: 'consent',
                    preference: 'Galapagos Terms of Use',
                    slug: makeCustomSlug('Galapagos Terms of Use'),
                    is_active: true,
                    created_by: admin.id,
                    updated_by: admin.id
                },
                {
                    id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                    category_id: 'fe037405-c676-4d98-bd05-85008900c838',
                    legal_basis: 'consent',
                    preference: 'Galapagos E-Mail Newsletter',
                    slug: makeCustomSlug('Galapagos E-Mail Newsletter'),
                    is_active: true,
                    created_by: admin.id,
                    updated_by: admin.id
                },
                {
                    id: '2b9fa7f9-2c1e-4621-a091-5e4bf539b875',
                    category_id: '59953d51-2449-4b65-950f-9f88654019bb',
                    legal_basis: 'consent',
                    preference: 'Accurate Information Confirmation',
                    slug: makeCustomSlug('Accurate Information Confirmation'),
                    is_active: true,
                    created_by: admin.id,
                    updated_by: admin.id
                }
            ];

            const consentLocales = [
                {
                    rich_text: "<p>Ce site est strictement destin?? aux m??decins et non aux infirmie(??)r(es) et / ou au grand public. Vous d??clarez explicitement ??tre m??decin au sens de l'article 3 de la loi sur l???art de gu??rir.</p>",
                    consent_id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
                    locale: 'fr_BE'
                },
                {
                    rich_text: "<p>Vous d??clarez que les donn??es saisies sont vos donn??es personnelles et que les informations sont compl??tes et exactes. En aucun cas, vos donn??es ne peuvent ??tre partag??es avec des tiers pour permettre ?? ces tiers d'acc??der au pr??sent site. Vous devez imm??diatement informer Galapagos de toute utilisation non autoris??e connue ou soup??onn??e de vos informations personnelles dans le cadre de l'acc??s ?? ce site.</p>",
                    consent_id: '2b9fa7f9-2c1e-4621-a091-5e4bf539b875',
                    locale: 'fr_BE'
                },
                {
                    rich_text: "<p>Je consens ?? ce que Galapagos m'envoie des informations promotionnelles et environnementales concernant tous les produits et services de Galapagos ?? l'adresse mail que j'ai fournie. <br> <br> Pour obtenir de plus amples informations sur la mani??re dont nous traitons vos donn??es ?? caract??re personnel, veuillez vous r??f??rer ?? notre <a href='https://www.glpg.com/belgique/fr-politique-de-confidentialite' target='_blank'>D??claration de confidentialit??</a>.</p>",
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
        consentSeeder], function (err) {
        if (err) console.error(err);
        else console.info('DB seed completed!');
        process.exit();
    });
}

init();
