const faker = require('faker');
const jwt = require('jsonwebtoken');

process.env.TOKEN_SECRET = 'super-secret-private-key';
process.env.APPLICATION_TOKEN_SECRET = 'application-token-secret-key';
const defaultUserId = 'ce2f07f9-c40b-43b8-8200-124de9fc2e46';
const defaultAdminId = 'f29b63e5-36c7-4210-a5a8-c1e9d0c5b9e4';
const defaultApplicationId = '9017a1ee-3391-40a0-ad50-70bc7f1657f0';
const defaultHCPuserId = 'db2baac3-46d1-425f-b62d-3730a294fd0e';
const demoConsentId = '3bb2057b-3006-4c87-9ce1-166bd291e86f';

module.exports = {
    defaultApplication: {
        id: defaultApplicationId,
        name: faker.company.companyName(),
        email: 'hcp-portal@glpg.com',
        password: 'strong-password',
        created_by: defaultAdminId,
        updated_by: defaultAdminId,
        access_token: jwt.sign(
            {
                id: defaultApplicationId,
                email: 'hcp-portal@glpg.com',
            },
            process.env.APPLICATION_TOKEN_SECRET,
            { expiresIn: '30d', issuer: defaultApplicationId }
        ),
    },
    users: {
        defaultAdmin: {
            id: defaultAdminId,
            name: 'Default Admin',
            type: 'admin',
            email: 'default-admin@cdp.com',
            password: faker.internet.password(8),
            updated_by: defaultAdminId,
            access_token: jwt.sign(
                {
                    id: defaultAdminId,
                    name: 'Admin',
                    email: 'default-admin@cdp.com',
                },
                process.env.TOKEN_SECRET,
                { expiresIn: '2d', issuer: defaultAdminId }
            ),
        },
        defaultUser: {
            id: defaultUserId,
            application_id: defaultApplicationId,
            name: 'Default User',
            email: 'default-user@cdp.com',
            password: 'strong-password',
            created_by: defaultAdminId,
            updated_by: defaultAdminId,
            access_token: jwt.sign(
                {
                    id: defaultUserId,
                    name: 'Default User',
                    email: 'default-user@cdp.com',
                },
                process.env.TOKEN_SECRET,
                { expiresIn: '2d', issuer: defaultUserId }
            ),
        },
    },
    hcp: {
        defaultUser: {
            uuid: defaultHCPuserId,
            application_id: defaultApplicationId,
            first_name: 'Default HCP',
            last_name: 'User',
            email: 'default-hcp-user@cdp.com',
            password: faker.internet.password(8),
            created_by: defaultAdminId,
            updated_by: defaultAdminId,
        },
    },
    consent: {
        demoConsent: {
            id: demoConsentId,
            title: 'Sharing personal data with 3rd parties',
            type: 'online',
            'opt-in_type': 'single',
            category: 'MC',
            country_code: 'BE',
        },
    },
};
