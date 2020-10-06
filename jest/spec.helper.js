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
const hcpValidUserId = '1ffe73e9-7922-4640-ba0c-3628b3358ab8';
const hcpInvalidUserId = '1ffe73e9-7922-4640-ba0c-3628b3358ba8';

module.exports = {
    defaultApplication: {
        id: defaultApplicationId,
        name: faker.company.companyName(),
        slug: 'jyseleca',
        email: 'jyseleca@glpg.com',
        password: 'strong-password',
        consent_confirmation_path: 'a',
        journey_redirect_path: 'a',
        reset_password_link: 'a',
        login_link: 'a',
        logo_link: 'a',
        forgot_password_link: '',
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
            countries: ['BE','AD','DE','IT','NL','ES','IE'],
            access_token: jwt.sign({ id: defaultAdminId }, process.env.CDP_TOKEN_SECRET, { expiresIn: '2d', issuer: defaultAdminId }),
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
            access_token: jwt.sign({ id: defaultUserId }, process.env.CDP_TOKEN_SECRET, { expiresIn: '2d', issuer: defaultUserId }),
        }
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
            country_iso2: 'nl',
            language_code: 'nl',
            locale: 'nl_nl',
            salutation: 'Mr',
            specialty_onekey: 'SP.WNL.01',
            created_by: defaultAdminId,
            updated_by: defaultAdminId,
            domain: 'http://www.example.com'
        },
        userWithValidUUID: {
            id: hcpValidUserId,
            first_name: faker.name.lastName(),
            last_name: faker.name.firstName(),
            uuid: '99912495001',
            email: faker.internet.email(),
            country_iso2: 'NL',
            language_code: 'nl',
            locale: 'nl_nl',
            salutation: 'Mr',
            specialty_onekey: 'SP.WNL.01',
            domain: 'http://www.example.com',
        },
        userWithInvalidUUID: {
            id: hcpInvalidUserId,
            first_name: faker.name.lastName(),
            last_name: faker.name.firstName(),
            uuid: faker.random.uuid(),
            email: faker.internet.email(),
            country_iso2: 'NL',
            language_code: 'nl',
            locale: 'nl_nl',
            salutation: 'Mr',
            specialty_onekey: 'SP.WNL.01',
            domain: 'http://www.example.com',
        }
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
            slug: 'a-3c2569b2',
            legal_basis: 'consent',
            preference: '',
            country_iso2: 'nl',
            locale: 'nl_nl'
        },
        demoConsentLocales: [
            {
                rich_text: '<p>I agree to the Galapagos <a href="https://www.glpg.com/">Terms of Service.</a></p>',
                consent_id: demoConsentId,
                locale: 'nl_nl'
            },
            {
                rich_text: '<p>I agree to the Galapagos <a href="https://www.glpg.com/">Terms of Service.</a></p>',
                consent_id: demoConsentId,
                locale: 'nl_be'
            }
        ],
        demoConsentCountry: [
            {
                consent_id: demoConsentId,
                country_iso2: 'nl',
                opt_type: 'single-opt-in'
            },
            {
                consent_id: demoConsentId,
                country_iso2: 'be',
                opt_type: 'double-opt-in'
            }
        ]
    },
    permissions: [
        { id: UserPermissionID, module: Modules.PLATFORM.value, status: "active", title: Modules.PLATFORM.title, created_by: "7a6492f0-022a-40ab-9b51-d1faf5d74385", updated_by: "7a6492f0-022a-40ab-9b51-d1faf5d74385" },
        { id: HcpPermissionID, module: Modules.INFORMATION.value, status: "active", title: Modules.INFORMATION.title, created_by: "7a6492f0-022a-40ab-9b51-d1faf5d74385", updated_by: "7a6492f0-022a-40ab-9b51-d1faf5d74385" }
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
