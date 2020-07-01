const Consent = require('./consent.model');

async function getConsents(req, res) {
    const { country_code } = req.query;

    try {
        const consents = await Consent.findAll({ where: { country_code }});

        const response = { country_code, consents };

        res.json(response);
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.getConsents = getConsents;
