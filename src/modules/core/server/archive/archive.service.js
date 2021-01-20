const archive = require('./archive.model');

async function archiveData(data) {
    try {
        await archive.create(data);
    } catch (err) {
        console.error(err);
    }
}

exports.archiveData = archiveData;
