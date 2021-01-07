const path = require('path');
const async = require('async');

async function init() {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));

    await config.initEnvironmentVariables();
    const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

    const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

    const ClinicalTrialHistoryModel = require(path.join(process.cwd(), 'src/modules/clinical-trials/server/clinical-trials.history.model.js'));
    require(path.join(process.cwd(), 'src/modules/clinical-trials/server/clinical-trials.trial.model.js'));
    const ClinicalTrialLocationModel = require(path.join(process.cwd(), 'src/modules/clinical-trials/server/clinical-trials.location.model.js'));

    async function clinicalTrilalsDbStructureSeeder() {
        await sequelize.clinitalTrialsConnector.query(`CREATE SCHEMA IF NOT EXISTS "${nodecache.getValue('POSTGRES_CLINICAL_TRIALS_SCHEMA')}"`);
        await sequelize.clinitalTrialsConnector.sync();
    }

    function clinicalTrialsDbDummyDataSeeder() {
        ClinicalTrialHistoryModel.bulkCreate([
            {
                description: 'initial history entry',
                value: ''
            }
        ], {
            returning: true,
            ignoreDuplicates: false
        });

        ClinicalTrialLocationModel.bulkCreate([
            {
                location_facility: 'facility',
                location_city: 'test city',
                location_zip: '12721',
                location_country: 'TestCountry',
                lat: 17.669,
                long: 23.000
            }
        ], {
            returning: true,
            ignoreDuplicates: false
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
