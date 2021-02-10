const faker = require('faker');
const jwt = require('jsonwebtoken');
var crypto = require('crypto');

process.env.CDP_TOKEN_SECRET = 'super-secret-private-key';
process.env.APPLICATION_TOKEN_SECRET = 'application-token-secret-key';
process.env.CDP_COOKIE_SECRET = 'cookie-secret-key';
process.env.CONSENT_CONFIRMATION_TOKEN_SECRET = 'consent-confirmation-secret';
const defaultUserId = 'ce2f07f9-c40b-43b8-8200-124de9fc2e46';
const defaultAdminId = 'f29b63e5-36c7-4210-a5a8-c1e9d0c5b9e4';
const defaultApplicationId = '9017a1ee-3391-40a0-ad50-70bc7f1657f0';
const defaultHCPuserId = 'db2baac3-46d1-425f-b62d-3730a294fd0e';
const demoConsentCategoryId = 'fe037405-c676-4d98-bd05-85008900c838';
const demoFaqId = '169e974d-8474-4a5f-87ae-5d7d66796a1a';
const demoConsentId = '3bb2057b-3006-4c87-9ce1-166bd291e86f';
const userManagementServiceCategoryID = 'bd2b3849-a1a0-40ab-900a-346926edc572';
const systemAdminPermissionSetID = '1ffe73e9-7922-4640-ba0c-3628b3358aa8';
const SystemAdminProfileID = '1ffe73e9-7922-4640-ba0c-3628b3358aa9';
const HCPServiceCategoryID = '1ffe73e9-7922-4640-ba0c-3628b3358ab9';
const DPOServiceCategoryID = '1ffe73e9-7922-4640-ba0c-3628b3358ac9';
const hcpValidUserId = '1ffe73e9-7922-4640-ba0c-3628b3358ab8';
const hcpInvalidUserId = '1ffe73e9-7922-4640-ba0c-3628b3358ba8';

module.exports = {
    signCookie: (value) => {
        const cookieSecret = process.env.CDP_COOKIE_SECRET;
        return value + '.' + crypto
            .createHmac('sha256', cookieSecret)
            .update(value)
            .digest('base64')
            .replace(/\=+$/, '');
    },
    generateConsentConfirmationToken: (doc) => jwt.sign({
        id: doc.id
    }, process.env.CONSENT_CONFIRMATION_TOKEN_SECRET, {
        expiresIn: '7d',
        issuer: doc.id.toString()
    }),
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
        auth_secret: 'a8cb35f8-7090-4267-83c6-5ed2da1c4e93',
        approve_user_path: '/bin/public/glpg-brandx/mail/approve-user',
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
            countries: ['BE', 'AD', 'DE', 'IT', 'NL', 'ES', 'IE'],
            profileId: SystemAdminProfileID,
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
            profileId: SystemAdminProfileID,
            created_by: defaultAdminId,
            updated_by: defaultAdminId,
            access_token: jwt.sign({ id: defaultUserId }, process.env.CDP_TOKEN_SECRET, { expiresIn: '2d', issuer: defaultUserId }),
        }
    },
    hcp: {
        defaultUser: {
            id: defaultHCPuserId,
            uuid: '9391239123',
            application_id: defaultApplicationId,
            first_name: 'Default HCP',
            last_name: 'User',
            salutation: 'Mr',
            email: 'default-hcp-user@cdp.com',
            password: 'strong-password',
            status: 'self_verified',
            country_iso2: 'nl',
            language_code: 'nl',
            locale: 'nl_nl',
            salutation: 'Mr',
            origin_url: 'https://www-dev.jyseleca.nl',
            specialty_onekey: 'SP.WNL.01',
            created_by: defaultAdminId,
            updated_by: defaultAdminId,
        },
        userWithValidUUID: {
            id: hcpValidUserId,
            first_name: faker.name.lastName(),
            last_name: faker.name.firstName(),
            uuid: '99912495001',
            email: faker.internet.email(),
            country_iso2: 'NL',
            language_code: 'nl',
            status: 'self_verified',
            origin_url: 'https://www-dev.jyseleca.nl',
            locale: 'nl_nl',
            salutation: 'Mr',
            specialty_onekey: 'SP.WNL.01',
        },
        userWithInvalidUUID: {
            id: hcpInvalidUserId,
            first_name: faker.name.lastName(),
            last_name: faker.name.firstName(),
            uuid: '123912839cc',
            email: faker.internet.email(),
            country_iso2: 'NL',
            status: 'not_verified',
            origin_url: 'https://www-dev.jyseleca.nl',
            language_code: 'nl',
            locale: 'nl_nl',
            salutation: 'Mr',
            specialty_onekey: 'SP.WNL.01',
        }
    },
    consent: {
        demoConsentCategory: {
            id: demoConsentCategoryId,
            title: "Direct Marketing",
            slug: 'direct-marketing',
            type: 'dm'
        },
        demoConsent: {
            id: demoConsentId,
            category_id: demoConsentCategoryId,
            preference: 'Consent Preference',
            slug: 'consent-preference-56f8ce23',
            legal_basis: 'consent',
            country_iso2: 'nl',
            locale: 'nl_nl',
            is_active: true
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
    faq: {
        demoFaq: {
            id: demoFaqId,
            question: 'Key Benefits of a CDP',
            answer: '<p>CDPs improve your organization, better your customer relationships, and complement your current software and marketing efforts. Here are a handful of key benefits of having a CDP.</p>',
            categories: ['general'],
            created_by: defaultAdminId,
            updated_by: defaultAdminId
        }

    },
    okla: {

    },
    serviceCategories: [
        { id: userManagementServiceCategoryID, title: "Management of Customer Data Platform", slug: "platform", created_by: defaultAdminId, updated_by: defaultAdminId },
        { id: HCPServiceCategoryID, title: "HCP", slug: "information", created_by: defaultAdminId, updated_by: defaultAdminId },
        { id: DPOServiceCategoryID, title: "DPO", slug: "privacy", created_by: defaultAdminId, updated_by: defaultAdminId }
    ],
    permissionSet: [
        { id: systemAdminPermissionSetID, title: "System Admin Permission Set", slug: "system_admin", type: 'standard', countries: ["BE", "FR", "DE", "IT", "NL", "ES", "GB"], description: "This is the default permission set for System Admin", created_by: defaultAdminId, updated_by: defaultAdminId, },
    ],
    permissionSet_serviceCategories: [
        { permissionset_id: systemAdminPermissionSetID, serviceCategoryId: userManagementServiceCategoryID },
        { permissionset_id: systemAdminPermissionSetID, serviceCategoryId: HCPServiceCategoryID },
        { permissionset_id: systemAdminPermissionSetID, serviceCategoryId: DPOServiceCategoryID }
    ],
    userProfile: [
        { id: SystemAdminProfileID, title: "System Admin", slug: "system_admin", type: 'standard', description: "This is the default profile for System Admin", created_by: defaultAdminId, updated_by: defaultAdminId }
    ],
    userProfile_permissionSet: [
        { user_profile_id: SystemAdminProfileID, permissionset_id: systemAdminPermissionSetID }
    ]
};
