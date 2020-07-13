const { Op } = require('sequelize');
const Consent = require('./consent.model');

async function getConsents(req, res) {
    try {
        const { country_iso2 } = req.query;
        const consents = await Consent.findAll({
            where: {
                country_iso2: {
                    [Op.or]: [
                        country_iso2.toUpperCase(),
                        country_iso2.toLowerCase(),
                    ],
                },
            },
        });

        const response = { country_iso2: country_iso2.toUpperCase(), consents };

        res.json(response);
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.getConsents = getConsents;
