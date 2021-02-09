const Audit = require('./audit.model');
const _ = require('lodash');

const difference = (updatedValue, previousValue) => {
    const updates = _.transform(updatedValue, function(result, value, key) {
        if (!_.isEqual(value, previousValue[key])) {
            result.old_value = { ...result.old_value, [key]: previousValue[key] };
            result.new_value = { ...result.new_value, [key]: value };
        }
    });

    return updates.new_value ? updates : false;
}

async function log(data) {
    try {
        await Audit.create(data);
    } catch (error) {
        console.log(error);
        return error;
    }
}

exports.log = log;
exports.difference = difference;
