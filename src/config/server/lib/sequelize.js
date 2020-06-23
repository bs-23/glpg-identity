const Sequelize = require('sequelize');
const nodecache = require('./nodecache');

const postgresUrl = nodecache.getValue("POSTGRES_URL");
const postgresDatabase = nodecache.getValue("POSTGRES_DATABASE");

const sequelize = new Sequelize(`${postgresUrl}/${postgresDatabase}`, {logging: false});

module.exports = sequelize;
