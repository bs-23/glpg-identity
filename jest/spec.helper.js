const jwt = require("jsonwebtoken");
const faker = require("faker");

process.env.TOKEN_SECRET = faker.random.uuid();

module.exports = {
    client: {
        name: "Test Client",
        email: faker.internet.email(),
        password: faker.internet.password()
    },
    users: {
        systemAdmin: {
            id: "f29b63e5-36c7-4210-a5a8-c1e9d0c5b9e4",
            name: faker.name.firstName(),
            type: "system_admin",
            email: "system-admin@ciam.com",
            password: faker.internet.password(8),
            access_token: jwt.sign({
                id: "f29b63e5-36c7-4210-a5a8-c1e9d0c5b9e4",
                name: faker.name.firstName(),
                email: "system-admin@ciam.com",
            }, process.env.TOKEN_SECRET, { expiresIn: "2d", issuer: "f29b63e5-36c7-4210-a5a8-c1e9d0c5b9e4" })
        },
        siteAdmin: {
            id: "f29b63e5-36c7-4210-a5a8-c1e9d0c5b9e5",
            name: faker.name.firstName(),
            email: "site-admin@ciam.com",
            password: faker.internet.password(8),
            access_token: jwt.sign({
                id: "f29b63e5-36c7-4210-a5a8-c1e9d0c5b9e5",
                name: faker.name.firstName(),
                email: "site-admin@ciam.com",
            }, process.env.TOKEN_SECRET, { expiresIn: "2d", issuer: "f29b63e5-36c7-4210-a5a8-c1e9d0c5b9e5" })
        }
    }
};
