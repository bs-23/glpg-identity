const path = require("path");
const jwt = require("jsonwebtoken");
const config = require("../config");

process.env.TOKEN_SECRET = "6368451b-50bc9a455e62";

config.server.strategies.forEach(function (strategy) {
    require(path.resolve(strategy))();
});

module.exports = {
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