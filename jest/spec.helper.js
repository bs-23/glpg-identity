const faker = require('faker');
const jwt = require('jsonwebtoken');

const path = require('path')
const { Modules } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));

process.env.CDP_TOKEN_SECRET = 'super-secret-private-key';
process.env.APPLICATION_TOKEN_SECRET = 'application-token-secret-key';
const defaultUserId = 'ce2f07f9-c40b-43b8-8200-124de9fc2e46';
const defaultAdminId = 'f29b63e5-36c7-4210-a5a8-c1e9d0c5b9e4';
const defaultApplicationId = '9017a1ee-3391-40a0-ad50-70bc7f1657f0';
const defaultHCPuserId = 'db2baac3-46d1-425f-b62d-3730a294fd0e';
const demoConsentCategoryId = 'fe037405-c676-4d98-bd05-85008900c838';
const demoConsentId = '3bb2057b-3006-4c87-9ce1-166bd291e86f';
const UserPermissionID = 'e31e7b72-8dd9-43cf-a2b2-823963bfad45';
const HcpPermissionID = 'bd2b3849-a1a0-40ab-900a-346926edc572';
const adminRoleID = '1ffe73e9-7922-4640-ba0c-3628b3358aa8';

module.exports = {
    defaultApplication: {
        id: defaultApplicationId,
        name: faker.company.companyName(),
        slug: 'hcp-portal',
        email: 'hcp-portal@glpg.com',
        password: 'strong-password',
        consent_confirmation_link: 'a',
        reset_password_link: 'a',
        login_link: 'a',
        logo_link: 'a',
        created_by: defaultAdminId,
        updated_by: defaultAdminId,
        access_token: jwt.sign({
            id: defaultApplicationId,
            email: 'hcp-portal@glpg.com',
        }, process.env.APPLICATION_TOKEN_SECRET, { expiresIn: '30d', issuer: defaultApplicationId }),
    },
    users: {
        defaultAdmin: {
            id: defaultAdminId,
            first_name: 'Default Admin',
            last_name: '',
            type: 'admin',
            email: 'default-admin@cdp.com',
            password: faker.internet.password(8),
            updated_by: defaultAdminId,
            access_token: jwt.sign(
                {
                    id: defaultAdminId,
                    first_name: 'Admin',
                    last_name: '',
                    email: 'default-admin@cdp.com',
                },
                process.env.CDP_TOKEN_SECRET,
                { expiresIn: '2d', issuer: defaultAdminId }
            ),
        },
        defaultUser: {
            id: defaultUserId,
            application_id: defaultApplicationId,
            first_name: 'Default',
            last_name: 'User',
            email: 'default-user@cdp.com',
            password: 'strong-password',
            expiry_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
            created_by: defaultAdminId,
            updated_by: defaultAdminId,
            access_token: jwt.sign(
                {
                    id: defaultUserId,
                    first_name: 'Default User',
                    last_name: '',
                    email: 'default-user@cdp.com',
                },
                process.env.CDP_TOKEN_SECRET,
                { expiresIn: '2d', issuer: defaultUserId }
            ),
        },
    },
    hcp: {
        defaultUser: {
            id: defaultHCPuserId,
            uuid: defaultHCPuserId,
            application_id: defaultApplicationId,
            first_name: 'Default HCP',
            last_name: 'User',
            salutation: 'Mr',
            email: 'default-hcp-user@cdp.com',
            password: 'strong-password',
            country_iso2: 'NL',
            language_code: 'en',
            salutation: 'Mr',
            specialty_onekey: 'SP.WNL.01',
            created_by: defaultAdminId,
            updated_by: defaultAdminId,
        },
    },
    consent: {
        demoConsentCategory: {
            id: demoConsentCategoryId,
            title: "Direct Marketing",
            type: 'dm'
        },
        demoConsent: {
            id: demoConsentId,
            category_id: demoConsentCategoryId,
            title: 'a',
            rich_text: '<h1>a</h1>',
            slug: 'a',
            type: 'online',
            opt_type: 'single',
            country_iso2: 'NL',
            locale: 'en',
        }
    },
    permissions: [
        { id: UserPermissionID, module: Modules.USER.value, status: "active", title: Modules.USER.title, created_by: "7a6492f0-022a-40ab-9b51-d1faf5d74385", updated_by: "7a6492f0-022a-40ab-9b51-d1faf5d74385" },
        { id: HcpPermissionID, module: Modules.HCP.value, status: "active", title: Modules.HCP.title, created_by: "7a6492f0-022a-40ab-9b51-d1faf5d74385", updated_by: "7a6492f0-022a-40ab-9b51-d1faf5d74385" }
    ],
    roles: [
        { id: adminRoleID, name: 'System Admin', slug: 'system-admin', description: "Has access to all the services", created_by: "7a6492f0-022a-40ab-9b51-d1faf5d74385", updated_by: "7a6492f0-022a-40ab-9b51-d1faf5d74385" }
    ],
    rolePermissions: [
        { "permissionId": UserPermissionID, "roleId": adminRoleID },
        { "permissionId": HcpPermissionID, "roleId": adminRoleID }
    ],
    userRoles: {
        defaultAdmin: [
            { "roleId": adminRoleID, "userId": defaultAdminId }
        ],
        defaultUser: [
            { "roleId": adminRoleID, "userId": defaultUserId }
        ]
    }
};
