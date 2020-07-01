const { Op } = require('sequelize');
const Consent = require('./consent.model');

async function getConsents(req, res) {
    try {
        const { country_code } = req.query;
        const consents = await Consent.findAll({
            where: {
                country_code: {
                    [Op.or]: [
                        country_code.toUpperCase(),
                        country_code.toLowerCase(),
                    ],
                },
            },
        });

        const response = { country_code: country_code.toUpperCase(), consents };

        res.json(response);
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.getConsents = getConsents;
