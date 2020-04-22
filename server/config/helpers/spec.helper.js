process.env.NODE_ENV = "test";
process.env.TOKEN_SECRET = "6368451b-50bc9a455e62";
process.env.POSTGRES_DATABASE_URL = "postgres://postgres:root@localhost:5432/ciam-test";

const jwt = require("jsonwebtoken");
const sequelize = require("../lib/sequelize");

const admin = {
    name: "System Admin",
    role: "system-admin",
    email: "admin@ciam.com",
    password: "xxx-xxx-xxx"
};

beforeAll(async (done) => {
    // await sequelize.query(`DROP DATABASE "ciam-test";`);
    // await sequelize.query(`CREATE DATABASE "ciam-test" WITH OWNER = postgres;`);
    await sequelize.query("CREATE SCHEMA IF NOT EXISTS ciam;")
    await sequelize.sync({alter: true});

    const User = require("../../user/user.model");
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
