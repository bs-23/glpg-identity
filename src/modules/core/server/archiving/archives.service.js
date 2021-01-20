const Archive = require('./archives.model');

async function archiveData(data) {
    try {
        await Archive.create(data);
    } catch (error) {
        console.log(error);
        return error;
    }
}

exports.archiveData = archiveData;
