const Sequelize = require('sequelize');
const nodecache = require('./nodecache');

const postgresCdpUrl = nodecache.getValue('POSTGRES_CDP_URL');
const postgresCdpDatabase = nodecache.getValue('POSTGRES_CDP_DATABASE');
const postgresDatasyncUrl = nodecache.getValue('POSTGRES_DATASYNC_URL');
const postgresDatasyncDatabase = nodecache.getValue('POSTGRES_DATASYNC_DATABASE');
const clinicalTrialsUrl = nodecache.getValue('CLINICAL_TRIALS_URL');
const clinicalTrialsDevDatabase = nodecache.getValue('CLINICAL_TRIALS_DEV_DATABASE');
const clinicalTrialsStageDatabase = nodecache.getValue('CLINICAL_TRIALS_STAGE_DATABASE');
const clinicalTrialsProductionDatabase = nodecache.getValue('CLINICAL_TRIALS_PRODUCTION_DATABASE');

exports.cdpConnector = new Sequelize(`${postgresCdpUrl}/${postgresCdpDatabase}`, {logging: false});
exports.datasyncConnector = new Sequelize(`${postgresDatasyncUrl}/${postgresDatasyncDatabase}`, {logging: false});

if(clinicalTrialsUrl && clinicalTrialsDevDatabase && clinicalTrialsStageDatabase && clinicalTrialsProductionDatabase)
{
    exports.clinitalTrialsDevConnectior = new Sequelize(`${clinicalTrialsUrl}/${clinicalTrialsDevDatabase}`, {logging: false});
    exports.clinitalTrialsStageConnectior = new Sequelize(`${clinicalTrialsUrl}/${clinicalTrialsStageDatabase}`, {logging: false});
    exports.clinitalTrialsProductionConnectior = new Sequelize(`${clinicalTrialsUrl}/${clinicalTrialsProductionDatabase}`, {logging: false});
}
