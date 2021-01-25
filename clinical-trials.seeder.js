const path = require('path');
const async = require('async');

async function init() {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));

    await config.initEnvironmentVariables();
    const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

    const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

    const ClinicalTrialHistoryModel = require(path.join(process.cwd(), 'src/modules/clinical-trials/server/clinical-trials.history.model.js'));
    require(path.join(process.cwd(), 'src/modules/clinical-trials/server/clinical-trials.trial.model.js'));
    const ClinicalTrialTrialModel = require(path.join(process.cwd(), 'src/modules/clinical-trials/server/clinical-trials.trial.model.js'));
    const ClinicalTrialLocationModel = require(path.join(process.cwd(), 'src/modules/clinical-trials/server/clinical-trials.location.model.js'));

    async function clinicalTrilalsDbStructureSeeder() {
        await sequelize.clinitalTrialsConnector.query(`CREATE SCHEMA IF NOT EXISTS "${nodecache.getValue('POSTGRES_CLINICAL_TRIALS_SCHEMA')}"`);
        await sequelize.clinitalTrialsConnector.sync();
    }

    function clinicalTrialsDbDummyDataSeeder() {
        ClinicalTrialHistoryModel.destroy({ truncate: { cascade: true } }).then(() => {
            ClinicalTrialHistoryModel.bulkCreate([
                {
                    description: 'initial history entry',
                    value: ''
                }
            ], {
                returning: true,
                ignoreDuplicates: false
            });
        });
        ClinicalTrialTrialModel.destroy({ truncate: { cascade: true } }).then(() => {
            ClinicalTrialTrialModel.bulkCreate([
                {
                    
                }
                
            ], {
                returning: true,
                ignoreDuplicates: false,
                include: { model: ClinicalTrialLocationModel, as: 'locations' }
            }).then(trial=>{
            });
        });
    }

    async.waterfall([
        clinicalTrilalsDbStructureSeeder,
        clinicalTrialsDbDummyDataSeeder], function (err) {
        if (err) console.error(err);
        else console.info('DB seed completed!');
        process.exit();
    });
}

init();
