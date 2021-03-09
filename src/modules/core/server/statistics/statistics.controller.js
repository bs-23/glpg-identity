const path = require('path');
const { QueryTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));
const HcpConsents = require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-consents.model'));
const HCPS = require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-profile.model'));

async function getStatistics(req, res){
    try{
        const total_consents = await HcpConsents.count({});
        const hot_statistics = {
            consents: 0
        }
        res.json(hot_statistics);
    }
    catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }

}

exports.getStatistics = getStatistics;
