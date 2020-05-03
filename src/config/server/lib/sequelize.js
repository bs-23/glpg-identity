const Sequelize = require("sequelize");

const sequelize = new Sequelize(`${process.env.POSTGRES_URL}/${process.env.POSTGRES_DATABASE}`, {logging: false});

module.exports = sequelize;
