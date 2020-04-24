process.env.NODE_ENV = "test";
process.env.TOKEN_SECRET = "6368451b-50bc9a455e62";
process.env.POSTGRES_DATABASE_URL = "postgres://postgres:root@localhost:5432/ciam-test";

const path = require("path");
const config = require("../config");
const sequelize = require("../lib/sequelize");

const admin = {
    name: "System Admin",
    type: "System Admin",
    email: "system-admin@ciam.com",
    password: "xxx-xxx-xxx"
};

config.server.strategies.forEach(function (strategy) {
    require(path.resolve(strategy))();
});

beforeAll(async (done) => {
    // await sequelize.query(`DROP DATABASE "ciam-test";`);
    // await sequelize.query(`CREATE DATABASE "ciam-test" WITH OWNER = postgres;`);
    await sequelize.query("CREATE SCHEMA IF NOT EXISTS ciam;")
    await sequelize.sync();

    const User = require("../../../modules/user/server/user.model");
    await User.create(admin);
    done();
});

afterAll(async (done) => {
    await sequelize.query(`DROP SCHEMA "ciam" CASCADE;`);
    await sequelize.close();
    done();
});

module.exports = {
    users: { admin }
};
