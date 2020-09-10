const path = require('path');
const async = require('async');

async function init() {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));

    await config.initEnvironmentVariables();

    const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

    const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

    await sequelize.cdpConnector.query(`CREATE SCHEMA IF NOT EXISTS ${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`);

    const Application = require(path.join(process.cwd(), 'src/modules/application/server/application.model'));
    const User = require(path.join(process.cwd(), 'src/modules/user/server/user.model'));
    const ConsentCategory = require(path.join(process.cwd(), 'src/modules/consent/server/consent-category.model'));
    const Consent = require(path.join(process.cwd(), 'src/modules/consent/server/consent.model'));
    const ConsentLocale = require(path.join(process.cwd(), 'src/modules/consent/server/consent-locale.model'));
    const ConsentCountry = require(path.join(process.cwd(), 'src/modules/consent/server/consent-country.model'));
    const UserProfile = require(path.join(process.cwd(), "src/modules/user/server/user-profile.model"));
    const ServiceCategory = require(path.join(process.cwd(), "src/modules/user/server/permission/service-category.model"));
    const PermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/permission-set.model"));
    const PermissionSet_ServiceCategory = require(path.join(process.cwd(), "src/modules/user/server/permission-set/permissionSet-serviceCategory.model"));
    const UserProfile_PermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/userProfile-permissionSet.model"));
    const Role = require(path.join(process.cwd(), "src/modules/user/server/role/role.model"));
    const UserRole = require(path.join(process.cwd(), "src/modules/user/server/role/user-role.model"));
    const { Modules } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
    require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.model'));
    require(path.join(process.cwd(), 'src/modules/hcp/server/hcp_profile.model'));
    require(path.join(process.cwd(), 'src/modules/hcp/server/hcp_consents.model'));
    require(path.join(process.cwd(), 'src/modules/hcp/server/hcp_archives.model'));
    require(path.join(process.cwd(), 'src/modules/user/server/reset-password.model'));
    require(path.join(process.cwd(), 'src/modules/core/server/password/password-history.model.js'));

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
                { title: "Data Privacy Officer", type: 'standard', slug: "data_privacy_officer", description: "This is the default profile for Data Privacy Officer",  created_by: admin.id, updated_by: admin.id }
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
                admin.update({profileId: sysAdminProfile.id});
            })

        }).then(function () {
            callback();
        });
    }

    function serviceCategorySeeder(callback) {
        User.findOne({ where: { email: 'glpg@brainstation-23.com' } }).then(admin => {

            const serviceCategories = [
                { title: "Platform Manager", slug: "platform", created_by: admin.id, updated_by: admin.id },
                { title: "Information Manager", slug: "information", created_by: admin.id, updated_by: admin.id },
                { title: "Data Privacy Officer", slug: "privacy", created_by: admin.id, updated_by: admin.id }
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

    function permissionSetSeeder(callback) {

        User.findOne({ where: { email: 'glpg@brainstation-23.com' } }).then(admin => {

            const permissionSet = [
                { title: "Standard System Admin Permission Set", slug: "system_admin", type: 'standard', description: "This is the default permission set for System Admin", created_by: admin.id, updated_by: admin.id },
                { title: "Standard Site Admin Permission Set", slug: "site_admin", type: 'standard', description: "This is the default permission set for Site Admin", countries:["BE", "AD", "DE", "IT", "NL", "ES","IE"], created_by: admin.id, updated_by: admin.id },
                { title: "Standard GDS Permission Set", slug: "gds", type: 'standard', countries:["BE", "AD", "DE", "IT", "NL", "ES","IE"], description: "This is the default permission set for Global Data Steward", created_by: admin.id, updated_by: admin.id },
                { title: "Standard DPO Permission Set", slug: "data_privacy_officer", type: 'standard', description: "This is the default permission set for Local Data Steward", created_by: admin.id, updated_by: admin.id }
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

            Promise.all([systemAdmin_permissionSet, siteAdmin_permissionSet, hcpServiceCategory, userServiceCategory, consentServiceCategory, dpo_permissionSet]).then((values) => {
                const permissionSet_serviceCategory = [
                    { permissionSetId: values[0].id, serviceCategoryId: values[2].id },
                    { permissionSetId: values[0].id, serviceCategoryId: values[3].id },
                    { permissionSetId: values[0].id, serviceCategoryId: values[4].id },

                    { permissionSetId: values[1].id, serviceCategoryId: values[2].id },
                    { permissionSetId: values[1].id, serviceCategoryId: values[3].id },
                    { permissionSetId: values[1].id, serviceCategoryId: values[4].id },
                    { permissionSetId: values[5].id, serviceCategoryId: values[4].id }
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

        Promise.all([systemAdminProfile, systemAdminPermissionSet, sitedminProfile, siteAdminPermissionSet, gdsProfile, gdsPermissionSet, dpoProfile, dpoPermissionSet]).then((values) => {
            const userprofile_permissionSet = [
                { userProfileId: values[0].id, permissionSetId: values[1].id },
                { userProfileId: values[2].id, permissionSetId: values[3].id },
                { userProfileId: values[6].id, permissionSetId: values[7].id },
                { userProfileId: values[4].id, permissionSetId: values[5].id }
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
                    name: 'HCP Portal',
                    slug: convertToSlug('HCP Portal'),
                    email: 'hcp-portal@glpg.com',
                    password: 'P@ssword123',
                    consent_confirmation_link: 'http://172.16.229.25:4503/bin/public/glpg-hcpportal/consentConfirm.consent.html',
                    reset_password_link: 'http://172.16.229.25:4503/bin/public/glpg-hcpportal/journeyRedirect.journey.html',
                    login_link: 'http://172.16.229.25:4503/bin/public/glpg-hcpportal/journeyRedirect.journey.html',
                    logo_link: 'https://cdp-asset.s3.eu-central-1.amazonaws.com/hcp-portal/logo.png',
                    created_by: admin.id,
                    updated_by: admin.id
                },
                {
                    name: 'Jyseleca',
                    slug: convertToSlug('Jyseleca'),
                    email: 'jyseleca@glpg.com',
                    password: 'P@ssword123',
                    consent_confirmation_link: 'https://jyseleca-dev.glpg.com/bin/public/glpg-brandx/consentConfirm.consent.html',
                    reset_password_link: 'https://jyseleca-dev.glpg.com/bin/public/glpg-brandx/journeyRedirect.journey.html',
                    login_link: 'https://jyseleca-dev.glpg.com/bin/public/glpg-brandx/journeyRedirect.journey.html',
                    logo_link: 'https://cdp-asset.s3.eu-central-1.amazonaws.com/brandx/logo.png',
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

    function consentSeeder(callback) {
        const consent_categories = [
            { id: 'fe037405-c676-4d98-bd05-85008900c838', title: 'Direct Marketing', type: 'dm' },
            { id: '29374bce-7c3f-4408-a138-c062143d2247', title: 'Medical Consent', type: 'mc' },
            { id: '59953d51-2449-4b65-950f-9f88654019bb', title: 'General Consent', type: 'general' }
        ];

        const consents = [
            {
                id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
                title: 'I agree to the Galapagos Terms of Service',
                slug: '',
                category_id: '59953d51-2449-4b65-950f-9f88654019bb',
                legal_basis: 'consent',
                preference: 'Galapagos Terms of Use'
            },
            {
                id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                title: 'I give my consent to send me promotional email',
                slug: '',
                category_id: 'fe037405-c676-4d98-bd05-85008900c838',
                legal_basis: 'consent',
                preference: 'Promotional email marketing'
            }
        ];

        const consentLocales = [
            {
                rich_text: "<p>Je confirme que je suis un professionnel de la santé exerçant en Belgique, et j'accepte les <a href='#' target='_blank'>Conditions d'utilisation de Galapagos Belgique.</a></p>",
                consent_id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
                locale: 'fr_be'
            },
            {
                rich_text: "<p>Je consens à ce que Galapagos m'envoie des informations promotionnelles et informatives concernant tous les produits et services de Galapagos à l'adresse mail que j'ai fournie. <br> <br> Pour obtenir de plus amples informations sur la manière dont nous traitons vos données à caractère personnel, veuillez vous référer à notre <a href='#' target='_blank'>Déclaration de confidentialité.</a></p>",
                consent_id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                locale: 'fr_be'
            },
            {
                rich_text: "<p>zorgverlener ben die in Belgie werkzaam is en ik accepteer de <a href='#' target='_blank'>Gebruiksvoorwaarden</a> van Galapagos.nl.</p>",
                consent_id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
                locale: 'nl_be'
            },
            {
                rich_text: "<p>Ik geef Galapagos toestemming om mij via mijn e-mailadres promotie- en milieu-informatie over alle Galapagos-producten en -diensten te sturen. <br> <br> Raadpleeg onze <a href='#' target='_blank'>privacyverklaring</a> voor meer informatie over hoe we met uw persoonsgegevens omgaan.</p>",
                consent_id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                locale: 'nl_be'
            },
            {
                rich_text: '<p>Ik bevestig dat ik een professionele zorgverlener ben die in Nederland werkzaam is en ik accepteer de <a href="#" target="_blank">Gebruiksvoorwaarden</a> van galapagos.nl.</p>',
                consent_id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
                locale: 'nl_nl'
            },
            {
                rich_text: "<p>Ik geef galapagos toestemming om mij via mijn e-mailadres promotie- en milieu-informatie over alle galapagos-producten en -diensten te sturen. <br> <br> Raadpleeg onze <a href='#' target='_blank'>privacyverklaring</a> voor meer informatie over hoe we met uw persoonsgegevens omgaan.</p>",
                consent_id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                locale: 'nl_nl'
            }
        ];
        const consentCountries = [
            {
                consent_id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
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
                opt_type: 'double-opt-in'
            },
            {
                consent_id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                country_iso2: 'be',
                opt_type: 'double-opt-in'
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
    }

    async.waterfall([userSeeder,userProfileSeeder,userUpdateSeeder,serviceCategorySeeder, permissionSetSeeder,permissionSetServiceCategorySeeder, userProfilePermissionSetSeeder, applicationSeeder, consentSeeder], function (err) {
        if (err) console.error(err);
        else console.info('DB seed completed!');
        process.exit();
    });
}

init();
