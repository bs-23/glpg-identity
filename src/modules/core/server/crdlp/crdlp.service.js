const { Specialty, MultichannelConsent } = require('./crdlp.model');

async function getMultichannelConsents(attributes, where, orderBy, orderType, offset, limit) {
    let options = {};

    if(offset) {
        options.offset = offset;
    }

    if(limit) {
        options.limit = limit;
    }

    if(orderBy && orderType) {
        options.order = [[orderBy, orderType]];
    }

    if(attributes && attributes.length) {
        options.attributes = attributes;
    }

    if(where) {
        options.where = where;
    }

    const multichannel_consents = await MultichannelConsent.findAll(options);

    return multichannel_consents;
}

async function getMultichannelConsentCount(where) {
    const count = await MultichannelConsent.count({ where });

    return count;
}

async function getSpecialties(attributes, where) {
    let options = {};

    if(attributes && attributes.length) {
        options.attributes = attributes;
    }

    if(where) {
        options.where = where;
    }

    const specialties = await Specialty.findAll(options);

    return specialties;
}

exports.getSpecialties = getSpecialties;
exports.getMultichannelConsents = getMultichannelConsents;
exports.getMultichannelConsentCount = getMultichannelConsentCount;
