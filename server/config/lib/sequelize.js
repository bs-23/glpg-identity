const Sequelize = require("sequelize");

const sequelize = new Sequelize(process.env.POSTGRES_DATABASE_URL, {logging: false});

module.exports = sequelize;
