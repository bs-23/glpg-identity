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
                first_name: "Admin",
                last_name: '',
                password: "strong-password",
                type: "admin"
            }
        }).then(function () {
            callback();
        });
    }

    function permissionSeeder(callback) {
        const permissions = [
            { "module": Modules.USER.value, "status": "active", "title": Modules.USER.title, "created_by": "7a6492f0-022a-40ab-9b51-d1faf5d74385", "updated_by": "7a6492f0-022a-40ab-9b51-d1faf5d74385" },
            { "module": Modules.HCP.value, "status": "active", "title": Modules.HCP.title, "created_by": "7a6492f0-022a-40ab-9b51-d1faf5d74385", "updated_by": "7a6492f0-022a-40ab-9b51-d1faf5d74385" }
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

    function roleSeeder(callback) {
        const roles = [
            { "name": "User-Manager", "description": "Can Manage Users", "created_by": "7a6492f0-022a-40ab-9b51-d1faf5d74385", "updated_by": "7a6492f0-022a-40ab-9b51-d1faf5d74385" },
            { "name": "HCP-Manager", "description": "Can Manage HCPS", "created_by": "7a6492f0-022a-40ab-9b51-d1faf5d74385", "updated_by": "7a6492f0-022a-40ab-9b51-d1faf5d74385" },
        ];

        Role.destroy({ truncate:  { cascade: true } }).then(() => {
            Role.bulkCreate(roles, {
                returning: true,
                ignoreDuplicates: false
            }).then(function () {
                callback();
            });
        });
    }

    function rolePermissionSeeder(callback) {
        const userRole = Role.findOne({ where: { name: "User-Manager" } });
        const hcpRole = Role.findOne({ where: { name: "HCP-Manager" } });
        const userPermission = Permission.findOne({ where: { module: "user" } });
        const hcpPermission = Permission.findOne({ where: { module: "hcp" } });

        Promise.all([userRole, hcpRole, userPermission, hcpPermission]).then((values) => {
            const rolePermissions = [
                { "permissionId": values[2].id, "roleId": values[0].id},
                { "permissionId": values[3].id, "roleId": values[1].id},
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
        const admin = User.findOne({ where: { email: "admin@glpg-cdp.com" } });
        const userRole = Role.findOne({ where: { name: "User-Manager" } });
        const hcpRole = Role.findOne({ where: { name: "HCP-Manager" } });

        Promise.all([admin, userRole, hcpRole]).then((values) => {
            const userRoles = [
                { "roleId": values[1].id, "userId": values[0].id },
                { "roleId": values[2].id, "userId": values[0].id }
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

    function userPermissionSeeder(callback) {
        const admin = User.findOne({ where: { email: "admin@glpg-cdp.com" } });
        const userPermission = Permission.findOne({ where: { module: "user" } });
        const hcpPermission = Permission.findOne({ where: { module: "hcp" } });

        Promise.all([admin, userPermission, hcpPermission]).then((values) => {
            const userPermissions = [
                { "userId": values[0].id, "permissionId": values[1].id, "created_by": values[0].id, "updated_by": values[0].id },
                { "userId": values[0].id, "permissionId": values[2].id,  "created_by": values[0].id, "updated_by": values[0].id }
            ];

            UserPermission.destroy({ truncate: true }).then(() => {
                UserPermission.bulkCreate(userPermissions, {
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
            { "title": "Sample Request", "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "NL", "language_code": "en" },
            { "title": "Invite to KOL Webminar", "type": "online", "opt_type": "double", "category": "mc", "category_title": "Medical Consent", "country_iso2": "NL", "language_code": "en" },
            { "title": "Create credentials for gated HCP area", "type": "online", "opt_type": "double", "category": "mc", "category_title": "Medical Consent", "country_iso2": "NL", "language_code": "en" },
            { "title": "Register to E-mail Newsletter (Mass email)", "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "NL", "language_code": "en" },
            { "title": "Send congress Agenda via email", "type": "online", "opt_type": "double", "category": "mc", "category_title": "Medical Consent", "country_iso2": "NL", "language_code": "en" },
            { "title": "Congress Newsletter", "type": "online", "opt_type": "double", "category": "mc", "category_title": "Medical Consent", "country_iso2": "NL", "language_code": "en" },
            { "title": "Send Email about clinical trial studies", "type": "online", "opt_type": "double", "category": "mc", "category_title": "Medical Consent", "country_iso2": "NL", "language_code": "en" },
            { "title": "That medical information is shorten for teasering content and better readability", "type": "online", "opt_type": "double", "category": "mc", "category_title": "Medical Consent", "country_iso2": "NL", "language_code": "en" },
            { "title": "Send Mode of Action rich media content", "type": "online", "opt_type": "double", "category": "mc", "category_title": "Medical Consent", "country_iso2": "NL", "language_code": "en" },
            { "title": "Send e-Detailing aid", "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "NL", "language_code": "en" },
            { "title": "Invite to Remote Engagement", "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "NL", "language_code": "en" },
            { "title": "Send CLM content after RepSale visit", "type": "online", "opt_type": "double", "category": "dm", "category_title": "Direct Marketing", "country_iso2": "NL", "language_code": "en" },
        ];

        const convertToSlug = string => string.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-");

        const all_consents = consents.map( consent => {
            if(consent.title.length > 50){
                const code = uniqueSlug(consent.title);
                let new_title = consent.title.substring(0, 50);
                new_title += ` ${code}`;
                const slug = convertToSlug(new_title);
                return { ...consent, slug };
            }

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

    async.waterfall([applicationSeeder, userSeeder, consentSeeder, permissionSeeder,roleSeeder, rolePermissionSeeder, userRoleSeeder], function (err) {
        if (err) console.error(err);
        else console.info("DB seed completed!");
        process.exit();
    });
}

init();
