const path = require('path');
const async = require('async');
const pg = require('pg');
const { connect } = require('formik');
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function drop() {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));

    await config.initEnvironmentVariables();

    const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

    const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));



    function dropDB(callback, connection, dbname){
        let cs = `${connection}/postgres`;
        const client = new pg.Client(cs);
        client.connect();
        client.query(`drop DATABASE IF EXISTS "${dbname}"`).then(res => {
            client.end();
            callback();
        });
    }

    function dropCDPDevDB(callback){
        dropDB(callback, nodecache.getValue('CLINICAL_TRIALS_URL'), nodecache.getValue('POSTGRES_CDP_DATABASE'))
    }

    function dropClinicalTrialsDevDB(callback){
        dropDB(callback, nodecache.getValue('CLINICAL_TRIALS_URL'), nodecache.getValue('CLINICAL_TRIALS_DEV_DATABASE'))
    }
    function dropClinicalTrialsStageDB(callback){
        dropDB(callback, nodecache.getValue('CLINICAL_TRIALS_URL'), nodecache.getValue('CLINICAL_TRIALS_STAGE_DATABASE'))
    }
    function dropClinicalTrialsProductionDB(callback){
        dropDB(callback, nodecache.getValue('CLINICAL_TRIALS_URL'), nodecache.getValue('CLINICAL_TRIALS_PRODUCTION_DATABASE'))
    }

    console.warn("waring!! do you really want to delete all?");


    rl.question("If you are really sure to drop all tables, press enter ", function(val) {
        if(val === '' 
        || val === 'y' || val === 'Y' 
        || val === 'yes' || val === 'YES'){
            async.waterfall([
                dropCDPDevDB,
                dropClinicalTrialsDevDB,
                dropClinicalTrialsStageDB,
                dropClinicalTrialsProductionDB
            ], function (err) {
                if (err) console.error(err);
                else console.info('DB dropping completed!');
                process.exit();
            });
        }
        else {
            console.log('Good you are exiting then without dropping anything...');
            rl.close();
        }
    });

    rl.on("close", function() {
        console.log("\nBYE BYE !!!");
        process.exit(0);
    });

    
}

drop();
