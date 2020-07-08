const Audit = require('../../../modules/audit/audit.model');

async function log(data) {

    try {
        await Audit.create(data);
        return {
            isSuccess: true,
            message: 'Log created successfully'
        }

    } catch (error) {
        return {
            isSuccess: false,
            message: error
        }

    }
}

exports.log = log;
