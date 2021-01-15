const Audit = require('./audit.model');

async function log(data) {
    try {
        await Audit.create(data);
    } catch (error) {
        console.log(error);
        return error;
    }
}

exports.log = log;
