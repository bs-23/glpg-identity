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
const partnerRequestApplicationId = '8efce9d4-a01c-4f48-b114-4f0e6597f55a';
const defaultHCPuserId = 'db2baac3-46d1-425f-b62d-3730a294fd0e';
const demoConsentCategoryId = 'fe037405-c676-4d98-bd05-85008900c838';
const demoFaqId = '169e974d-8474-4a5f-87ae-5d7d66796a1a';
const demoConsentId = '3bb2057b-3006-4c87-9ce1-166bd291e86f';

const CDPServiceCategoryID = 'bd2b3849-a1a0-40ab-900a-346926eda572';
const UserManagementServiceCategoryID = 'bd2b3849-a1a0-40ab-900a-346926edb572';
const ProfileManagementServiceCategoryID = 'bd2b3849-a1a0-40ab-900a-346926edc572';
const RoleManagementServiceCategoryID = 'bd2b3849-a1a0-40ab-900a-346926edd572';
const PermissionSetManagementServiceCategoryID = 'bd2b3849-a1a0-40ab-900a-346926ede572';
const FaqManagementServiceCategoryID = 'bd2b3849-a1a0-40ab-900a-346926edf572';

const HCPServiceCategoryID = '2ffe73e9-7922-4640-ba0c-3628b3358aa9';
const HCPManagementServiceCategoryID = '2ffe73e9-7922-4640-ba0c-3628b3358ab9';
const DiscoverHcpHcoServiceCategoryID = '2ffe73e9-7922-4640-ba0c-3628b3358ac9';

const DPOServiceCategoryID = '3ffe73e9-7922-4640-ba0c-3628b3358aa9';
const ConsentManagementServiceCategoryID = '3ffe73e9-7922-4640-ba0c-3628b3358ab9';
const ConsentCategoryManagementServiceCategoryID = '3ffe73e9-7922-4640-ba0c-3628b3358ac9';
const ConsentCountryManagementServiceCategoryID = '3ffe73e9-7922-4640-ba0c-3628b3358ad9';
const ConsentPerformanceReportServiceCategoryID = '3ffe73e9-7922-4640-ba0c-3628b3358ae9';

const BusinessPartnerServiceCategoryID = '3730e090-cf4d-48e1-bcbe-d06796f0c7e3';
const VendorManagementServiceCategoryID = '7cb535aa-c286-4674-bf60-54bb797f836f';
const HCPRequestManagementServiceCategoryID = '17769868-7b35-4f39-b08e-abbf34d696d4';
const PartnerManagementServiceCategoryID = '9718f1f9-6cb1-4caa-ac6f-d07e4a2d6b94';

const systemAdminPermissionSetID = '1ffe73e9-7922-4640-ba0c-3628b3358aa8';
const SystemAdminProfileID = '1ffe73e9-7922-4640-ba0c-3628b3358aa9';
const hcpValidUserId = '1ffe73e9-7922-4640-ba0c-3628b3358ab8';
const hcpInvalidUserId = '1ffe73e9-7922-4640-ba0c-3628b3358ba8';
const PartnerRequestID = 'febcccb6-f102-4251-af9e-db44a2d554f6';
const PartnerID = 'b3c7c678-fcb3-4341-8e70-bd95efcf10d4';

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
        type: 'hcp-portal',
        email: 'jyseleca@glpg.com',
        password: 'strong-password',
        is_active: true,
        logo_url: 'a',
        metadata: {
            cache_clearing_url: "a",
            approve_user_path: '/bin/public/glpg-brandx/mail/approve-user'
        },
        created_by: defaultAdminId,
        updated_by: defaultAdminId,
        auth_secret: 'a8cb35f8-7090-4267-83c6-5ed2da1c4e93',
        access_token: jwt.sign({
            id: defaultApplicationId,
            email: 'hcp-portal@glpg.com',
        }, process.env.APPLICATION_TOKEN_SECRET, { expiresIn: '30d', issuer: defaultApplicationId }),
    },
    partnerRequestApplication: {
        id: partnerRequestApplicationId,
        name: 'Patients Organization',
        slug: 'Patients Organization',
        type: 'standard',
        email: 'patients-organization@glpg.com',
        password: 'P@ssword123',
        is_active: true,
        auth_secret: 'b248eaa4-583f-4ecd-9e9c-be8f58ab3c3e',
        created_by: defaultAdminId,
        updated_by: defaultAdminId,
        metadata: JSON.stringify({
            request_notification_link: 'https://onboarding-business-partner-dev.glpg.com/bin/public/glpg-forms/sendForm.invitation.html'
        }),
        access_token: jwt.sign({
            id: partnerRequestApplicationId,
            email: 'patients-organization@glpg.com',
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
            profile_id: SystemAdminProfileID,
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
            profile_id: SystemAdminProfileID,
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
            topics: ["general-information"],
            created_by: defaultAdminId,
            updated_by: defaultAdminId
        }
    },
    okla: {

    },
    serviceCategories: [
        { id: CDPServiceCategoryID, title: "Management of Customer Data Platform", slug: "platform", created_by: defaultAdminId, updated_by: defaultAdminId },
        { id: HCPServiceCategoryID, title: "HCP", slug: "information", created_by: defaultAdminId, updated_by: defaultAdminId },
        { id: DPOServiceCategoryID, title: "DPO", slug: "privacy", created_by: defaultAdminId, updated_by: defaultAdminId },
        { id: BusinessPartnerServiceCategoryID, title: "Business Partner Management", slug: "business-partner", created_by: defaultAdminId, updated_by: defaultAdminId },

        { id: UserManagementServiceCategoryID, title: "User & Access Management", slug: "manage-user", parent_id: CDPServiceCategoryID, created_by: defaultAdminId, updated_by: defaultAdminId },
        { id: ProfileManagementServiceCategoryID, title: "Manage Profiles", slug: "manage-profile", parent_id: CDPServiceCategoryID, created_by: defaultAdminId, updated_by: defaultAdminId },
        { id: RoleManagementServiceCategoryID, title: "Define Roles", slug: "manage-role", parent_id: CDPServiceCategoryID, created_by: defaultAdminId, updated_by: defaultAdminId },
        { id: PermissionSetManagementServiceCategoryID, title: "Manage Permission Sets", slug: "manage-permission-sets", parent_id: CDPServiceCategoryID, created_by: defaultAdminId, updated_by: defaultAdminId },
        { id: FaqManagementServiceCategoryID, title: "Manage FAQs", slug: "manage-faqs", parent_id: CDPServiceCategoryID, created_by: defaultAdminId, updated_by: defaultAdminId },

        { id: HCPManagementServiceCategoryID, title: "Manage HCP Master Data", slug: "manage-hcp", parent_id: HCPServiceCategoryID, created_by: defaultAdminId, updated_by: defaultAdminId },
        { id: DiscoverHcpHcoServiceCategoryID, title: "Discover Missing HCPs and HCOs", slug: "discover-hcp-hco", parent_id: HCPServiceCategoryID, created_by: defaultAdminId, updated_by: defaultAdminId },

        { id: ConsentManagementServiceCategoryID, title: "Manage New Consent", slug: "manage-consent", parent_id: DPOServiceCategoryID, created_by: defaultAdminId, updated_by: defaultAdminId },
        { id: ConsentCategoryManagementServiceCategoryID, title: "Configure Consent Category", slug: "consent-category", parent_id: DPOServiceCategoryID, created_by: defaultAdminId, updated_by: defaultAdminId },
        { id: ConsentCountryManagementServiceCategoryID, title: "Assign Consent to Country", slug: "consent-country", parent_id: DPOServiceCategoryID, created_by: defaultAdminId, updated_by: defaultAdminId },
        { id: ConsentPerformanceReportServiceCategoryID, title: "Generate Data Privacy & Consent Performance Report", slug: "consent-performance", parent_id: DPOServiceCategoryID, created_by: defaultAdminId, updated_by: defaultAdminId },

        { id: VendorManagementServiceCategoryID, title: "Manage Vendor Request", slug: "manage-vendor-request", parent_id: BusinessPartnerServiceCategoryID, created_by: defaultAdminId, updated_by: defaultAdminId },
        { id: HCPRequestManagementServiceCategoryID, title: "Manage Healthcare Entity Request", slug: "manage-entity-request", parent_id: BusinessPartnerServiceCategoryID, created_by: defaultAdminId, updated_by: defaultAdminId },
        { id: PartnerManagementServiceCategoryID, title: "Business Partner Management to Submit to ERP Systems", slug: "manage-business-partners", parent_id: BusinessPartnerServiceCategoryID, created_by: defaultAdminId, updated_by: defaultAdminId },
    ],
    permissionSet: [
        { id: systemAdminPermissionSetID, title: "System Admin Permission Set", slug: "system_admin", type: 'standard', countries: ["BE", "FR", "DE", "IT", "NL", "ES", "GB"], description: "This is the default permission set for System Admin", created_by: defaultAdminId, updated_by: defaultAdminId, },
    ],
    permissionSet_service: [
        { permissionset_id: systemAdminPermissionSetID, service_id: CDPServiceCategoryID },
        { permissionset_id: systemAdminPermissionSetID, service_id: HCPServiceCategoryID },
        { permissionset_id: systemAdminPermissionSetID, service_id: DPOServiceCategoryID },
        { permissionset_id: systemAdminPermissionSetID, service_id: BusinessPartnerServiceCategoryID },

        { permissionset_id: systemAdminPermissionSetID, service_id: UserManagementServiceCategoryID },
        { permissionset_id: systemAdminPermissionSetID, service_id: ProfileManagementServiceCategoryID },
        { permissionset_id: systemAdminPermissionSetID, service_id: RoleManagementServiceCategoryID },
        { permissionset_id: systemAdminPermissionSetID, service_id: PermissionSetManagementServiceCategoryID },
        { permissionset_id: systemAdminPermissionSetID, service_id: FaqManagementServiceCategoryID },

        { permissionset_id: systemAdminPermissionSetID, service_id: HCPManagementServiceCategoryID },
        { permissionset_id: systemAdminPermissionSetID, service_id: DiscoverHcpHcoServiceCategoryID },

        { permissionset_id: systemAdminPermissionSetID, service_id: ConsentManagementServiceCategoryID },
        { permissionset_id: systemAdminPermissionSetID, service_id: ConsentCategoryManagementServiceCategoryID },
        { permissionset_id: systemAdminPermissionSetID, service_id: ConsentCountryManagementServiceCategoryID },
        { permissionset_id: systemAdminPermissionSetID, service_id: ConsentPerformanceReportServiceCategoryID },

        { permissionset_id: systemAdminPermissionSetID, service_id: VendorManagementServiceCategoryID },
        { permissionset_id: systemAdminPermissionSetID, service_id: HCPRequestManagementServiceCategoryID },
        { permissionset_id: systemAdminPermissionSetID, service_id: PartnerManagementServiceCategoryID }
    ],
    userProfile: [
        { id: SystemAdminProfileID, title: "System Admin", slug: "system_admin", type: 'standard', description: "This is the default profile for System Admin", created_by: defaultAdminId, updated_by: defaultAdminId }
    ],
    userProfile_permissionSet: [
        { user_profile_id: SystemAdminProfileID, permissionset_id: systemAdminPermissionSetID }
    ],
    localizations: [
        { language_family: 'English', language_variant: 'British English', country_iso2: 'GB', locale: 'en_GB' },
        { language_family: 'English', language_variant: 'English', locale: 'en' },
        { language_family: 'Dutch', language_variant: 'Belgian Dutch', country_iso2: 'BE', locale: 'nl_BE' },
        { language_family: 'Dutch', language_variant: 'Standard Dutch', country_iso2: 'NL', locale: 'nl_NL' },
        { language_family: 'French', language_variant: 'Belgian French', country_iso2: 'BE', locale: 'fr_BE' },
        { language_family: 'French', language_variant: 'Standard French', country_iso2: 'FR', locale: 'fr_FR' },
        { language_family: 'French', language_variant: 'Luxembourgish French', country_iso2: 'LU', locale: 'fr_LU' },
        { language_family: 'German', language_variant: 'Standard German', country_iso2: 'DE', locale: 'de_DE' },
        { language_family: 'Spanish', language_variant: 'Castilian Spanish', country_iso2: 'ES', locale: 'es_ES' },
    ],
    partner_request: {
        id: PartnerRequestID,
        application_id: partnerRequestApplicationId,
        entity_type: "hco",
        first_name: "aa",
        last_name: "aa",
        email: "a@gmail.com",
        mdr_id: "a",
        country_iso2: "BE",
        locale: "fr_BE",
        procurement_contact: "a@gmail.com",
        uuid: "aa",
        workplace_name: "test_workplace_name",
        workplace_type: "healthcare_org",
        specialty: "SP.WBE.21",
        status: 'email_sent',
        created_by: defaultAdminId,
        updated_by: defaultAdminId
    },
    partner: {
        id: PartnerID,
        entity_type: 'hco',
        request_id: PartnerRequestID,
        first_name: "aa",
        last_name: "aa",
        email: "a@gmail.com",
        organization_name: 'aa',
        organization_type: 'healthcare_org',
        individual_type: 'individual',
        country_iso2: "BE",
        locale: "fr_BE",
        uuid: "aa",
        status: 'not_approved',
    }
};
