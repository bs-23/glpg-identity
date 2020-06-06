const faker = require("faker");
const jwt = require("jsonwebtoken");

process.env.TOKEN_SECRET = "super-secret-private-key";
const defaultUserId = "ce2f07f9-c40b-43b8-8200-124de9fc2e46";
const defaultAdminId = "f29b63e5-36c7-4210-a5a8-c1e9d0c5b9e4";
const defaultClientId = "9017a1ee-3391-40a0-ad50-70bc7f1657f0";

module.exports = {
    defaultClient: {
        id: defaultClientId,
        name: faker.company.companyName(),
        email: "default-client@cdp.com",
        password: faker.internet.password(8),
        created_by: defaultAdminId,
        updated_by: defaultAdminId,
    },
    users: {
        defaultAdmin: {
            id: defaultAdminId,
            name: "Default Admin",
            type: "admin",
            email: "default-admin@cdp.com",
            password: faker.internet.password(8),
            updated_by: defaultAdminId,
            access_token: jwt.sign({
                id: defaultAdminId,
                name: "Admin",
                email: "default-admin@cdp.com",
            }, process.env.TOKEN_SECRET, { expiresIn: "2d", issuer: defaultAdminId })
        },
        defaultUser: {
            id: defaultUserId,
            client_id: defaultClientId,
            name: "Default User",
            email: "default-user@cdp.com",
            password: "strong-password",
            created_by: defaultAdminId,
            updated_by: defaultAdminId,
            access_token: jwt.sign({
                id: defaultUserId,
                name: "Default User",
                email: "default-user@cdp.com",
            }, process.env.TOKEN_SECRET, { expiresIn: "2d", issuer: defaultUserId })
        }
    },
    countries: [{ "name": "Belgium", "country_iso2": "BE", "country_iso3": "BEL", "codebase": "WBE" }]
};
