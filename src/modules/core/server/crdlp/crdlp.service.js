const { Op, where, col, fn } = require('sequelize');

const { Specialty } = require('./crdlp.specialty.model');
const { MultichannelConsent } = require('./crdlp.multichannelconsent.model');

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

async function getSpecialties(attributes, where, order) {
    let options = {};

    if(attributes && attributes.length) {
        options.attributes = attributes;
    }

    if(where) {
        options.where = where;
    }

    if (order) {
        options.order = order;
    }

    const specialties = await Specialty.findAll(options);

    return specialties;
}

async function getSpecialtiesWithEnglishLocale(locale, codbase) {
    if (!locale || !codbase) return [];

    const specialties = await Specialty.findAll({
        where: {
            cod_locale: where(fn('lower', col('cod_locale')), fn('lower', locale)),
            codbase: where(fn('lower', col('codbase')), fn('lower', codbase))
        },
        attributes: ['cod_id_onekey']
    });

    const specialtiesCodIDOnekeys = specialties.map(sp => sp.cod_id_onekey);

    const specialtiesWithEnglishLocale = await Specialty.findAll({
        where: {
            cod_id_onekey: { [Op.in]: specialtiesCodIDOnekeys },
            [Op.or]: [
                { cod_locale: where(fn('lower', col('cod_locale')), 'en') },
                { cod_locale: where(fn('lower', col('cod_locale')), fn('lower', locale)) }
            ]
        },
        attributes: ['cod_id_onekey', 'codbase', 'cod_description', 'cod_locale']
    });

    return specialtiesWithEnglishLocale;
}

exports.getSpecialties = getSpecialties;
exports.getMultichannelConsents = getMultichannelConsents;
exports.getMultichannelConsentCount = getMultichannelConsentCount;
exports.getSpecialtiesWithEnglishLocale = getSpecialtiesWithEnglishLocale;
