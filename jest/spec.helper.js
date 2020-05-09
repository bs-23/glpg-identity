const jwt = require("jsonwebtoken");

process.env.TOKEN_SECRET = "6368451b-50bc9a455e62";

module.exports = {
    client: {
        name: "Test Client",
        email: "service.hcp@glpg-hcp.com",
        password: "xxx-xxx-xxx",
    },
    users: {
        systemAdmin: {
            id: "f29b63e5-36c7-4210-a5a8-c1e9d0c5b9e4",
            name: "System Admin",
            type: "System Admin",
            email: "system-admin@ciam.com",
            password: "xxx-xxx-xxx",
            access_token: jwt.sign({
                id: "f29b63e5-36c7-4210-a5a8-c1e9d0c5b9e4",
                name: "System Admin",
                email: "system-admin@ciam.com",
            }, process.env.TOKEN_SECRET, { expiresIn: "2d", issuer: "f29b63e5-36c7-4210-a5a8-c1e9d0c5b9e4" })
        }
    }
};
