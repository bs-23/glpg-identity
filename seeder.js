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
    const ConsentCategory = require(path.join(process.cwd(), 'src/modules/consent/server/consent-category.model'));
    const Consent = require(path.join(process.cwd(), 'src/modules/consent/server/consent.model'));
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
    const makeCustomSlug = (title, country, language) => {
        const code = uniqueSlug(`${title} ${country} ${language}`);
        if(title.length > 50) return convertToSlug(`${title.substring(0, 50)} ${code}`);
        return convertToSlug(`${title} ${code}`);
    }

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
        const consent_categories = [
            { "id": 1, "title": "Direct Marketing", "type": "dm" },
            { "id": 2, "title": "Medical Consent", "type": "mc" },
            { "id": 3, "title": "General Consent", "type": "general" },
        ]

        const consents = [
            { "category_id": 1, "title": "Sample Request", "markup": "<h1>Sample Request</h1>", "type": "online", "opt_type": "double", "country_iso2": "NL", "language_code": "en" },
            { "category_id": 3, "title": "Invite to KOL Webminar", "markup": "<h1>Invite to KOL Webmina</h1>", "type": "online", "opt_type": "double", "country_iso2": "NL", "language_code": "en" }
        ];

        // generating all slugs
        const all_consents = consents.map( consent => {
            const slug = makeCustomSlug(consent.title, consent.country_iso2, consent.language_code);
            return { ...consent, slug };
        });

        // console.log("===========================>", all_consents);

        Consent.destroy({
            where: {},
            include: [ { model: ConsentCategory } ]
        }).then(() => {
            ConsentCategory.bulkCreate(consent_categories, {
                returning: true,
                ignoreDuplicates: false
            }).then(function () {
                callback();
            });

            Consent.bulkCreate(all_consents, {
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
