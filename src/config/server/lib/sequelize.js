const Sequelize = require('sequelize');
const nodecache = require('./nodecache');
const logger = require('./winston');

const postgresCdpUrl = nodecache.getValue('POSTGRES_CDP_URL');
const postgresCdpDatabase = nodecache.getValue('POSTGRES_CDP_DATABASE');
const postgresDatasyncUrl = nodecache.getValue('POSTGRES_DATASYNC_URL');
const postgresDatasyncDatabase = nodecache.getValue('POSTGRES_DATASYNC_DATABASE');
const clinicalTrialsDatabase = nodecache.getValue('POSTGRES_CLINICAL_TRIALS_DATABASE');
const ppiDatabase = nodecache.getValue('POSTGRES_PPI_DATABASE');

exports.cdpConnector = new Sequelize(`${postgresCdpUrl}/${postgresCdpDatabase}`, { logging: (str) => { logger.info(str) }});
exports.datasyncConnector = new Sequelize(`${postgresDatasyncUrl}/${postgresDatasyncDatabase}`, { logging: (str) => { logger.info(str) }});
exports.clinitalTrialsConnector = new Sequelize(`${postgresCdpUrl}/${clinicalTrialsDatabase}`, { logging: (str) => { logger.info(str) }});
exports.ppiConnector = new Sequelize(`${postgresCdpUrl}/${ppiDatabase}`, { logging: (str) => { logger.info(str) }});
