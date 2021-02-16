const path = require('path');
const async = require('async');
const _USER = require('./hcp_demo.json');

async function init(){
    const config = require(path.join(process.cwd(), 'src/config/server/config'));

    await config.initEnvironmentVariables();
    const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

    const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

    const HcpArticlesModel = require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-articles.model.js'));

    async function ppiDbStructureSeeder() {
        await sequelize.ppiConnector.query(`CREATE SCHEMA IF NOT EXISTS "${nodecache.getValue('POSTGRES_PPI_SCHEMA')}"`);
        await sequelize.ppiConnector.sync({ force: true });
    }

    function ppiDbDummyDataSeeder() {
        HcpArticlesModel.destroy({ truncate: { cascade: true } }).then(() => {
            HcpArticlesModel.bulkCreate(_USER)
                .then(users => {
                    console.log(`successful adding users.`);
                })
                .catch(err => {
                    console.log(err);
                })
        });
    }

    async.waterfall([
        ppiDbStructureSeeder,
        ppiDbDummyDataSeeder], function (err) {
        if (err) console.error(err);
        else console.info('DB seed completed!');
        process.exit();
    });
}

init();
