const path = require('path');
const async = require('async');

async function init() {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));

    await config.initEnvironmentVariables();

    const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

    await sequelize.cdpConnector.query('CREATE SCHEMA IF NOT EXISTS ciam');

    const Application = require(path.join(process.cwd(), 'src/modules/application/server/application.model'));
    const User = require(path.join(process.cwd(), 'src/modules/user/server/user.model'));
    const User1 = require(path.join(process.cwd(), 'src/modules/user/server/user1.model'));
    const ConsentCategory = require(path.join(process.cwd(), 'src/modules/consent/server/consent-category.model'));
    const Consent = require(path.join(process.cwd(), 'src/modules/consent/server/consent.model'));
    const ConsentLocale = require(path.join(process.cwd(), 'src/modules/consent/server/consent-locale.model'));
    const ConsentCountry = require(path.join(process.cwd(), 'src/modules/consent/server/consent-country.model'));
    const RolePermission = require(path.join(process.cwd(), "src/modules/user/server/role/role-permission.model"));
    const Permission = require(path.join(process.cwd(), "src/modules/user/server/permission/permission.model"));
    const Role = require(path.join(process.cwd(), "src/modules/user/server/role/role.model"));
    const UserRole = require(path.join(process.cwd(), "src/modules/user/server/user-role.model"));
    const UserProfile = require(path.join(process.cwd(), "src/modules/user/server/user-profile.model"));
    const ServiceCategory = require(path.join(process.cwd(), "src/modules/user/server/permission/service-category.model"));
    const PermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/permission-set.model"));
    const PermissionSet_ServiceCategory = require(path.join(process.cwd(), "src/modules/user/server/permission-set/permissionSet-serviceCategory.model"));
    const UserProfile_PermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/userProfile-permissionSet.model"));
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
            where: { email: 'glpg.cdp@gmail.com' }, defaults: {
                first_name: 'System',
                last_name: 'Admin',
                password: 'P@ssword123',
                type: 'admin'
            }
        }).then(function () {
            callback();
        });
    }
    
    function user1Seeder(callback) {
        User1.findOrCreate({
            where: { email: 'glpg.cdp@gmail.com' }, defaults: {
                first_name: 'System',
                last_name: 'Admin',
                password: 'P@ssword123',
                type: 'admin'
            }
        }).then(function () {
            callback();
        });
    }

    function permissionSeeder(callback) {
        User.findOne({ where: { email: 'glpg.cdp@gmail.com' } }).then(admin => {

            const permissions = [
                { module: Modules.USER.value, status: "active", title: Modules.USER.title, created_by: admin.id, updated_by: admin.id },
                { module: Modules.HCP.value, status: "active", title: Modules.HCP.title, created_by: admin.id, updated_by: admin.id }
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
        User.findOne({ where: { email: 'glpg.cdp@gmail.com' } }).then(admin => {
            const roles = [
                { name: 'User & HCP Manager', slug: 'user-hcp-manager', description: 'Has access to all the services', created_by: admin.id, updated_by: admin.id },
                { name: 'User Manager', slug: 'user-manager', description: 'Has access to manage CDP users only', created_by: admin.id, updated_by: admin.id },
                { name: 'HCP Manager', slug: 'hcp-manager', description: 'Has access to manage HCP users only', created_by: admin.id, updated_by: admin.id }
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
        const adminRole = Role.findOne({ where: { slug: 'user-hcp-manager' } });
        const userManagerRole = Role.findOne({ where: { slug: 'user-manager' } });
        const hcpManagerRole = Role.findOne({ where: { slug: 'hcp-manager' } });

        const userPermission = Permission.findOne({ where: { module: 'user' } });
        const hcpPermission = Permission.findOne({ where: { module: 'hcp' } });

        Promise.all([adminRole, userManagerRole, hcpManagerRole, userPermission, hcpPermission]).then((values) => {
            const rolePermissions = [
                { roleId: values[0].id, permissionId: values[3].id },
                { roleId: values[0].id, permissionId: values[4].id },
                { roleId: values[1].id, permissionId: values[3].id },
                { roleId: values[2].id, permissionId: values[4].id }
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
        const admin = User.findOne({ where: { email: 'glpg.cdp@gmail.com' } });
        const adminRole = Role.findOne({ where: { slug: 'user-hcp-manager' } });

        Promise.all([admin, adminRole]).then((values) => {
            const userRoles = [
                { userId: values[0].id, roleId: values[1].id }
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

    function userProfileSeeder(callback) {
        User.findOne({ where: { email: 'glpg.cdp@gmail.com' } }).then(admin => {

            const userProfiles = [
                { title: "System Admin", slug: "system_admin", created_by: admin.id, updated_by: admin.id },
                { title: "Site Admin", slug: "site_admin", created_by: admin.id, updated_by: admin.id },
                { title: "GDS", slug: "gds", created_by: admin.id, updated_by: admin.id },
                { title: "LDS", slug: "lds", created_by: admin.id, updated_by: admin.id }
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


    function user1UpdateSeeder(callback) {
        User1.findOne({
            where: { email: 'glpg.cdp@gmail.com' }
        }).then(admin => {
            UserProfile.findOne({ where: { slug: 'system_admin' } }).then(sysAdminProfile => {
                admin.update({profileId: sysAdminProfile.id});
            })

        }).then(function () {
            callback();
        });
    }

    function serviceCategorySeeder(callback) {
        User.findOne({ where: { email: 'glpg.cdp@gmail.com' } }).then(admin => {

            const serviceCategories = [
                { title: "Information Management", slug: "hcp", created_by: admin.id, updated_by: admin.id },
                { title: "User Management", slug: "user", created_by: admin.id, updated_by: admin.id },
                { title: "Consent Management", slug: "consent", created_by: admin.id, updated_by: admin.id }
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

        User.findOne({ where: { email: 'glpg.cdp@gmail.com' } }).then(admin => {

            const permissionSet = [
                { title: "System Admin Permission Set", slug: "system_admin", created_by: admin.id, updated_by: admin.id },
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
        User.findOne({ where: { email: 'glpg.cdp@gmail.com' } }).then(admin => {
            const permissionSet = PermissionSet.findOne({ where: { slug: 'system_admin' } });
            const hcpServiceCategory = ServiceCategory.findOne({ where: { slug: 'hcp' } });
            const userServiceCategory = ServiceCategory.findOne({ where: { slug: 'user' } });
            const consentServiceCategory = ServiceCategory.findOne({ where: { slug: 'consent' } });

            Promise.all([permissionSet, hcpServiceCategory, userServiceCategory, consentServiceCategory]).then((values) => {
                const permissionSet_serviceCategory = [
                    { permissionSetId: values[0].id, serviceCategoryId: values[1].id },
                    { permissionSetId: values[0].id, serviceCategoryId: values[2].id },
                    { permissionSetId: values[0].id, serviceCategoryId: values[3].id },
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

        const permissionSet = PermissionSet.findOne({ where: { slug: 'system_admin' } });
        const userProfile = UserProfile.findOne({ where: { slug: 'system_admin' } });

        Promise.all([permissionSet, userProfile]).then((values) => {
            const userprofile_permissionSet = [
                { permissionSetId: values[0].id, userProfileId: values[1].id }
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
        User.findOne({ where: { email: 'glpg.cdp@gmail.com' } }).then(admin => {
            const applications = [
                {
                    name: 'HCP Portal',
                    slug: convertToSlug('HCP Portal'),
                    email: 'hcp-portal@glpg.com',
                    password: 'strong-password',
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
                    password: 'strong-password',
                    consent_confirmation_link: 'http://172.16.229.25:4503/bin/public/glpg-brandx/consentConfirm.consent.html',
                    reset_password_link: 'http://172.16.229.25:4503/bin/public/glpg-brandx/journeyRedirect.journey.html',
                    login_link: 'http://172.16.229.25:4503/bin/public/glpg-brandx/journeyRedirect.journey.html',
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
                type: 'online'
            },
            {
                id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                title: 'I give my consent to send me promotional email',
                slug: '',
                category_id: 'fe037405-c676-4d98-bd05-85008900c838',
                type: 'online'
            }
        ];

        const consentLocales = [
            {
                rich_text: "<p>J'accepte les Galapagos <a href='https://www.glpg.com/'>Conditions d'utilisation.</a></p>",
                consent_id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
                locale: 'fr'
            },
            {
                rich_text: '<p>I agree to the Galapagos <a href="https://www.glpg.com/">Terms of Service.</a></p>',
                consent_id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
                locale: 'en'
            },
            {
                rich_text: '<p>Ik ga akkoord met de Galapagos <a href="https://www.glpg.com/">Servicevoorwaarden.</a></p>',
                consent_id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
                locale: 'nl'
            },
            {
                rich_text: "<p>J'autorise Galapagos à m'envoyer des informations promotionnelles et environnementales concernant tous les produits et services Galapagos sur mon adresse e-mail fournie. Pour plus d'informations sur la manière dont nous traitons vos informations personnelles, veuillez consulter notre<a href='https://www.glpg.com/'>privacy notice.</a></p>",
                consent_id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                locale: 'fr'
            },
            {
                rich_text: '<p>I give my consent for Galapagos to send me promotional and environmental information concerning all of Galapagos products and services on my provided email address.</p> <p>For more information on how we treat your personal information please refer to our <a href="https://www.glpg.com/">privacy notice.</a></p>',
                consent_id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                locale: 'en'
            },
            {
                rich_text: '<p>Ik geef Galapagos mijn toestemming om mij promotionele en milieu-informatie te sturen over alle Galapagos-producten en -diensten op het door mij opgegeven e-mailadres. </p> <p> Voor meer informatie over hoe we omgaan met uw persoonlijke informatie, verwijzen wij u naar onze <a href="https://www.glpg.com/">privacyverklaring.</a></p>',
                consent_id: '01cfab4f-9fdd-4975-9a90-bbde78785109',
                locale: 'nl'
            }
        ];

        const consentCountries = [
            {
                consent_id: 'ebea072a-81d4-4507-a46b-cb365ea0c6db',
                country_iso2: 'fr',
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
                country_iso2: 'fr',
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

    async.waterfall([userSeeder,user1Seeder, permissionSeeder, roleSeeder, rolePermissionSeeder, userRoleSeeder, applicationSeeder, consentSeeder, userProfileSeeder, user1UpdateSeeder, serviceCategorySeeder, permissionSetSeeder, permissionSetServiceCategorySeeder, userProfilePermissionSetSeeder], function (err) {
        if (err) console.error(err);
        else console.info('DB seed completed!');
        process.exit();
    });
}

init();
