const path = require('path');
const async = require('async');
const uniqueSlug = require('unique-slug');

async function init() {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));

    await config.initEnvironmentVariables();

    const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

    await sequelize.cdpConnector.query('CREATE SCHEMA IF NOT EXISTS ciam');

    const Application = require(path.join(process.cwd(), 'src/modules/application/server/application.model'));
    const User = require(path.join(process.cwd(), 'src/modules/user/server/user.model'));
    const Consent = require(path.join(process.cwd(), 'src/modules/consent/server/consent.model'));
    const CountryConsent = require(path.join(process.cwd(), 'src/modules/consent/server/country-consent.model'));
    const RolePermission = require(path.join(process.cwd(), "src/modules/user/server/role/role-permission.model"));
    const Permission = require(path.join(process.cwd(), "src/modules/user/server/permission/permission.model"));
    const Role = require(path.join(process.cwd(), "src/modules/user/server/role/role.model"));
    const UserRole = require(path.join(process.cwd(), "src/modules/user/server/user-role.model"));
    const { Modules } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
    require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.model'));
    require(path.join(process.cwd(), 'src/modules/hcp/server/hcp_profile.model'));
    require(path.join(process.cwd(), 'src/modules/hcp/server/hcp_consents.model'));
    require(path.join(process.cwd(), 'src/modules/user/server/reset-password.model'));

    await sequelize.cdpConnector.sync();

    const convertToSlug = string => string.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

    function userSeeder(callback) {
        User.findOrCreate({
            where: { email: 'glpg.cdp@gmail.com' }, defaults: {
                first_name: 'System',
                last_name: 'Admin',
                password: 'strong-password',
                type: 'admin'
            }
        }).then(function () {
            callback();
        });
    }

    function permissionSeeder(callback) {
        const permissions = [
            { module: Modules.USER.value, status: "active", title: Modules.USER.title, created_by: "7a6492f0-022a-40ab-9b51-d1faf5d74385", updated_by: "7a6492f0-022a-40ab-9b51-d1faf5d74385" },
            { module: Modules.HCP.value, status: "active", title: Modules.HCP.title, created_by: "7a6492f0-022a-40ab-9b51-d1faf5d74385", updated_by: "7a6492f0-022a-40ab-9b51-d1faf5d74385" }
        ];

        Permission.destroy({ truncate: { cascade: true } }).then(() => {
            Permission.bulkCreate(permissions, {
                returning: true,
                ignoreDuplicates: false
            }).then(function () {
                callback();
            });
        });
    }

    function roleSeeder(callback) {
        const roles = [
            { name: 'System Admin', slug: 'system-admin', description: 'Has access to all the services', created_by: "7a6492f0-022a-40ab-9b51-d1faf5d74385", updated_by: "7a6492f0-022a-40ab-9b51-d1faf5d74385" },
            { name: 'User Manager', slug: 'user-manager', description: 'Has access to manage CDP users only', created_by: "7a6492f0-022a-40ab-9b51-d1faf5d74385", updated_by: "7a6492f0-022a-40ab-9b51-d1faf5d74385" }
        ];

        Role.destroy({ truncate: { cascade: true } }).then(() => {
            Role.bulkCreate(roles, {
                returning: true,
                ignoreDuplicates: false
            }).then(function () {
                callback();
            });
        });
    }

    function rolePermissionSeeder(callback) {
        const adminRole = Role.findOne({ where: { slug: 'system-admin' } });
        const userManagerRole = Role.findOne({ where: { slug: 'user-manager' } });

        const userPermission = Permission.findOne({ where: { module: 'user' } });
        const hcpPermission = Permission.findOne({ where: { module: 'hcp' } });

        Promise.all([adminRole, userManagerRole, userPermission, hcpPermission]).then((values) => {
            const rolePermissions = [
                { roleId: values[0].id, permissionId: values[2].id },
                { roleId: values[0].id, permissionId: values[3].id },
                { roleId: values[1].id, permissionId: values[2].id }
            ];

            RolePermission.destroy({ truncate:  { cascade: true } }).then(() => {
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
        const adminRole = Role.findOne({ where: { slug: 'system-admin' } });

        Promise.all([admin, adminRole]).then((values) => {
            const userRoles = [
                { userId: values[0].id, roleId: values[1].id }
            ];

            UserRole.destroy({ truncate:  { cascade: true } }).then(() => {
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
        User.findOne({ where: { email: 'glpg.cdp@gmail.com' } }).then(admin => {
            const applications = [
                {
                    name: 'HCP Portal',
                    slug: convertToSlug('HCP Portal'),
                    email: 'hcp-portal@glpg.com',
                    password: 'strong-password',
                    consent_confirmation_link: 'http://example.com/bin/public/glpg-hcpportal/consent/confirm.html',
                    created_by: admin.id,
                    updated_by: admin.id
                },
                {
                    name: 'BrandX',
                    slug: convertToSlug('BrandX'),
                    email: 'brandx@glpg.com',
                    password: 'strong-password',
                    consent_confirmation_link: 'http://example.com/bin/public/glpg-hcpportal/consent/confirm.html',
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
        const consents = [
            { id: 1, "title": "Sample Request" },
            { id: 2, "title": "Invite to KOL Webminar" },
            { id: 3, "title": "Create credentials for gated HCP area" },
            { id: 4, "title": "Register to E-mail Newsletter (Mass email)" },
            { id: 5, "title": "Send congress Agenda via email" },
            { id: 6, "title": "Congress Newsletter" },
            { id: 7, "title": "Send Email about clinical trial studies" },
            { id: 8, "title": "That medical information is shorten for teasering content and better readability" },
            { id: 9, "title": "Send Mode of Action rich media content" },
            { id: 10, "title": "Send e-Detailing aid" },
            { id: 11, "title": "Invite to Remote Engagement" },
            { id: 12, "title": "Send CLM content after RepSale visit" },
        ];

        const country_consents = [
            { "consent_id": 1, "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "BE", "language_code": "en" },
            { "consent_id": 1, "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "NL", "language_code": "en" },
            { "consent_id": 2, "type": "online", "opt_type": "single", "category": "mc", "category_title": "Medical Consent", "country_iso2": "BE", "language_code": "en" },
            { "consent_id": 2, "type": "online", "opt_type": "double", "category": "mc", "category_title": "Medical Consent", "country_iso2": "NL", "language_code": "en" },
            { "consent_id": 3, "type": "online", "opt_type": "single", "category": "mc", "category_title": "Medical Consent", "country_iso2": "BE", "language_code": "en" },
            { "consent_id": 3, "type": "online", "opt_type": "double", "category": "mc", "category_title": "Medical Consent", "country_iso2": "NL", "language_code": "en" },
            { "consent_id": 4, "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "BE", "language_code": "en" },
            { "consent_id": 4, "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "NL", "language_code": "en" },
            { "consent_id": 5, "type": "online", "opt_type": "single", "category": "mc", "category_title": "Medical Consent", "country_iso2": "BE", "language_code": "en" },
            { "consent_id": 5, "type": "online", "opt_type": "double", "category": "mc", "category_title": "Medical Consent", "country_iso2": "NL", "language_code": "en" },
            { "consent_id": 6, "type": "online", "opt_type": "single", "category": "mc", "category_title": "Medical Consent", "country_iso2": "BE", "language_code": "en" },
            { "consent_id": 6, "type": "online", "opt_type": "double", "category": "mc", "category_title": "Medical Consent", "country_iso2": "NL", "language_code": "en" },
            { "consent_id": 7, "type": "online", "opt_type": "single", "category": "mc", "category_title": "Medical Consent", "country_iso2": "BE", "language_code": "en" },
            { "consent_id": 7, "type": "online", "opt_type": "double", "category": "mc", "category_title": "Medical Consent", "country_iso2": "NL", "language_code": "en" },            
            { "consent_id": 8, "type": "online", "opt_type": "single", "category": "mc", "category_title": "Medical Consent", "country_iso2": "BE", "language_code": "en" },
            { "consent_id": 8, "type": "online", "opt_type": "double", "category": "mc", "category_title": "Medical Consent", "country_iso2": "NL", "language_code": "en" },
            { "consent_id": 9, "type": "online", "opt_type": "single", "category": "mc", "category_title": "Medical Consent", "country_iso2": "BE", "language_code": "en" },
            { "consent_id": 9, "type": "online", "opt_type": "double", "category": "mc", "category_title": "Medical Consent", "country_iso2": "NL", "language_code": "en" },
            { "consent_id": 10, "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "BE", "language_code": "en" },
            { "consent_id": 10, "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "NL", "language_code": "en" },
            { "consent_id": 11, "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "BE", "language_code": "en" },
            { "consent_id": 11, "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "NL", "language_code": "en" },
            { "consent_id": 12, "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "BE", "language_code": "en" },
            { "consent_id": 12, "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "NL", "language_code": "en" },
        ];

        const all_country_consents = country_consents.map( country_consent => {
            const [{ title }] = consents.filter( consent => consent.id === country_consent.consent_id);

            if(title.length > 50){
                const code = uniqueSlug(title);
                let new_title = title.substring(0, 50);
                new_title += ` ${code} ${country_consent.country_iso2}`;
                const slug = convertToSlug(new_title);
                return { ...country_consent, slug };
            }

            const slug = convertToSlug(`${title} ${country_consent.country_iso2}`);
            return { ...country_consent, slug };
        });

        CountryConsent.destroy({
            where: {},
            include: [
                {
                    model: Consent
                }
            ]
        }).then(() => {
            Consent.bulkCreate(consents, {
                returning: true,
                ignoreDuplicates: false
            }).then(function () {
                callback();
            });

            CountryConsent.bulkCreate(all_country_consents, {
                returning: true,
                ignoreDuplicates: false
            }).then(function () {
                callback();
            });
        });
    }

    async.waterfall([userSeeder, permissionSeeder,roleSeeder, rolePermissionSeeder, userRoleSeeder, applicationSeeder, consentSeeder], function (err) {
        if (err) console.error(err);
        else console.info("DB seed completed!");
        process.exit();
    });
}

init();
