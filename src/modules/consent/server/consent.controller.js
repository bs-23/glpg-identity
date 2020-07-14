const { Op } = require('sequelize');
const Consent = require('./consent.model');

async function getConsents(req, res) {
    try {
        const { code } = req.query;
        let [country_iso2, language_code] = code.split('_');
        language_code = language_code || 'en';

        const consents = await Consent.findAll({
            where: {
                country_iso2: {
                    [Op.or]: [
                        country_iso2.toUpperCase(),
                        country_iso2.toLowerCase(),
                    ],
                },
                language_code: {
                    [Op.or]: [
                        language_code.toUpperCase(),
                        language_code.toLowerCase(),
                    ],
                },
            },
        });

        const response = { country_iso2: country_iso2.toUpperCase(), language_code: language_code.toUpperCase(), consents };

        res.json(response);
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.getConsents = getConsents;
