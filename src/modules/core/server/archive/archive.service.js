const archive = require('./archive.model');

async function archiveData(data) {
    try {
        const arc = await archive.create(data);
        return arc.dataValues;
    } catch (err) {
        console.error(err);
    }
}

exports.archiveData = archiveData;
