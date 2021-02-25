const archive = require('./archive.model');
const path = require('path');
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));

async function archiveData(data) {
    try {
        const arc = await archive.create(data);
        return arc.dataValues;
    } catch (err) {
        logger.error(err);
    }
}

exports.archiveData = archiveData;
