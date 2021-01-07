const Sequelize = require('sequelize');
const nodecache = require('./nodecache');

const postgresCdpUrl = nodecache.getValue('POSTGRES_CDP_URL');
const postgresCdpDatabase = nodecache.getValue('POSTGRES_CDP_DATABASE');
const postgresDatasyncUrl = nodecache.getValue('POSTGRES_DATASYNC_URL');
const postgresDatasyncDatabase = nodecache.getValue('POSTGRES_DATASYNC_DATABASE');
const clinicalTrialsDatabase = nodecache.getValue('POSTGRES_CLINICAL_TRIALS_DATABASE');

exports.cdpConnector = new Sequelize(`${postgresCdpUrl}/${postgresCdpDatabase}`, {logging: false});
exports.datasyncConnector = new Sequelize(`${postgresDatasyncUrl}/${postgresDatasyncDatabase}`, {logging: false});
exports.clinitalTrialsConnector = new Sequelize(`${postgresCdpUrl}/${clinicalTrialsDatabase}`, {logging: false});
