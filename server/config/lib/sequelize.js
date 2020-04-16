const Sequelize = require("sequelize");

const sequelize = new Sequelize("ciam-dev", "postgres", "root", {
    dialect: "postgres",
    host: "localhost"
});

module.exports = sequelize;
