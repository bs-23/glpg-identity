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
    const RolePermission = require(path.join(process.cwd(), "src/modules/user/server/role/role-permission.model"));
    const Permission = require(path.join(process.cwd(), "src/modules/user/server/permission/permission.model"));
    const Role = require(path.join(process.cwd(), "src/modules/user/server/role/role.model"));
    const UserRole = require(path.join(process.cwd(), "src/modules/user/server/user-role.model"));
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
                password: '8s297LC#WRrB',
                type: 'admin'
            }
        }).then(function () {
            callback();
        });
    }

    function permissionSeeder(callback) {
        User.findOne({ where: { email: 'glpg@brainstation-23.com' } }).then(admin => {

            const permissions = [
                { module: Modules.PLATFORM.value, status: "active", title: Modules.PLATFORM.title, created_by: admin.id, updated_by: admin.id },
                { module: Modules.INFORMATION.value, status: "active", title: Modules.INFORMATION.title, created_by: admin.id, updated_by: admin.id },
                { module: Modules.PRIVACY.value, status: "active", title: Modules.PRIVACY.title, created_by: admin.id, updated_by: admin.id }
            ];

            Permission.destroy({ truncate: { cascade: true } }).then(() => {
                Permission.bulkCreate(permissions, {
                    returning: true,
                    ignoreDuplicates: false
                }).then(function () {
                    callback();
                });
            });
        });
    }

    function roleSeeder(callback) {
        User.findOne({ where: { email: 'glpg@brainstation-23.com' } }).then(admin => {
            const roles = [
                { name: 'Platform Manager', slug: 'platform-manager', description: 'Has access to Management of Customer Data Platform', created_by: admin.id, updated_by: admin.id },
                { name: 'Information Manager', slug: 'information-manager', description: 'Has access to Information Management', created_by: admin.id, updated_by: admin.id },
                { name: 'Data Privacy Officer', slug: 'dpo', description: 'Has access to Data Privacy & Consent Management', created_by: admin.id, updated_by: admin.id }
            ];

            Role.destroy({ truncate: { cascade: true } }).then(() => {
                Role.bulkCreate(roles, {
                    returning: true,
                    ignoreDuplicates: false
                }).then(function () {
                    callback();
                });
            });
        });
    }

    function rolePermissionSeeder(callback) {
        const platformManagerRole = Role.findOne({ where: { slug: 'platform-manager' } });
        const informationManagerRole = Role.findOne({ where: { slug: 'information-manager' } });
        const dpoManagerRole = Role.findOne({ where: { slug: 'dpo' } });

        const platformPermission = Permission.findOne({ where: { module: 'platform' } });
        const informationPermission = Permission.findOne({ where: { module: 'information' } });
        const privacyPermission = Permission.findOne({ where: { module: 'privacy' } });

        Promise.all([platformManagerRole, informationManagerRole, dpoManagerRole, platformPermission, informationPermission, privacyPermission]).then((values) => {
            const rolePermissions = [
                { roleId: values[0].id, permissionId: values[3].id },
                { roleId: values[1].id, permissionId: values[4].id },
                { roleId: values[2].id, permissionId: values[5].id }
            ];

            RolePermission.destroy({ truncate: { cascade: true } }).then(() => {
                RolePermission.bulkCreate(rolePermissions, {
                    returning: true,
                    ignoreDuplicates: false
                }).then(function () {
                    callback();
                });
            });
        });
    }

    function userRoleSeeder(callback) {
        const admin = User.findOne({ where: { email: 'glpg@brainstation-23.com' } });

        const platformManagerRole = Role.findOne({ where: { slug: 'platform-manager' } });
        const informationManagerRole = Role.findOne({ where: { slug: 'information-manager' } });
        const dpoManagerRole = Role.findOne({ where: { slug: 'dpo' } });

        Promise.all([admin, platformManagerRole, informationManagerRole, dpoManagerRole]).then((values) => {
            const userRoles = [
                { userId: values[0].id, roleId: values[1].id },
                { userId: values[0].id, roleId: values[2].id },
                { userId: values[0].id, roleId: values[3].id }
            ];

            UserRole.destroy({ truncate: { cascade: true } }).then(() => {
                UserRole.bulkCreate(userRoles, {
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
                    password: 'T2^iyH3^4C6m',
                    consent_confirmation_link: 'http://172.16.229.25:4503/bin/public/glpg-hcpportal/consentConfirm.consent.html',
                    reset_password_link: 'http://172.16.229.25:4503/bin/public/glpg-hcpportal/journeyRedirect.journey.html',
                    login_link: 'http://172.16.229.25:4503/bin/public/glpg-hcpportal/journeyRedirect.journey.html',
                    logo_link: 'https://cdp-asset.s3.eu-central-1.amazonaws.com/hcp-portal/logo.png',
                    created_by: admin.id,
                    updated_by: admin.id
                },
                {
                    name: 'BrandX',
                    slug: convertToSlug('BrandX'),
                    email: 'brandx@glpg.com',
                    password: 'L$y62@4*rGiF',
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
                legal_basis: 'consent'
            },
            {
                id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                title: 'I give my consent to send me promotional email',
                slug: '',
                category_id: 'fe037405-c676-4d98-bd05-85008900c838',
                legal_basis: 'consent'
            }
        ];

        const consentLocales = [
            {
                rich_text: "<p>Je confirme que je suis un professionnel de la santé exerçant aux Pays-Bas, et j'accepte les <a href='#' target='_blank'>Conditions d'utilisation de Jyseleca Belgique.</a></p>",
                consent_id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
                locale: 'fr_be'
            },
            {
                rich_text: "<p>Ik bevestig dat ik een professionele zorgverlener ben die in Belgique werkzaam is en ik accepteer de <a href='#' target='_blank'>Gebruiksvoorwaarden</a> van Jyseleca.nl.</p>",
                consent_id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
                locale: 'nl_be'
            },
            {
                rich_text: '<p>Ik bevestig dat ik een professionele zorgverlener ben die in Nederland werkzaam is en ik accepteer de <a href="#" target="_blank">Gebruiksvoorwaarden</a> van Jyseleca.nl.</p>',
                consent_id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
                locale: 'nl_nl'
            },
            {
                rich_text: "<p>Ik geef Jyseleca toestemming om mij via mijn e-mailadres promotie- en milieu-informatie over alle Jyseleca-producten en -diensten te sturen. <br> <br> Raadpleeg onze <a href='#' target='_blank'>privacyverklaring</a> voor meer informatie over hoe we met uw persoonsgegevens omgaan.</p>",
                consent_id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                locale: 'nl_nl'
            },
            {
                rich_text: "<p>Ik geef Jyseleca toestemming om mij via mijn e-mailadres promotie- en milieu-informatie over alle Jyseleca-producten en -diensten te sturen. <br> <br> Raadpleeg onze <a href='#' target='_blank'>privacyverklaring</a> voor meer informatie over hoe we met uw persoonsgegevens omgaan.</p>",
                consent_id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                locale: 'nl_be'
            },
            {
                rich_text: "<p>Je consens à ce que Jyseleca m'envoie des informations promotionnelles et environnementales concernant tous les produits et services de Jyseleca à l'adresse mail que j'ai fournie. <br> <br> Pour obtenir de plus amples informations sur la manière dont nous traitons vos données à caractère personnel, veuillez vous référer à notre <a href='#' target='_blank'> Déclaration de confidentialité.</a></p>",
                consent_id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                locale: 'fr_be'
            }
        ];
        const consentCountries = [
            {
                consent_id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
                country_iso2: 'be',
                opt_type: 'single'
            },
            {
                consent_id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
                country_iso2: 'nl',
                opt_type: 'single'
            },
            {
                consent_id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                country_iso2: 'nl',
                opt_type: 'double'
            },
            {
                consent_id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                country_iso2: 'be',
                opt_type: 'double'
            },
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

    async.waterfall([userSeeder, permissionSeeder, roleSeeder, rolePermissionSeeder, userRoleSeeder, applicationSeeder, consentSeeder], function (err) {
        if (err) console.error(err);
        else console.info('DB seed completed!');
        process.exit();
    });
}

init();
