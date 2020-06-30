const Consent = require('./consent.model');

async function getConsents(req, res) {
    try {
        const { country_code } = req.query;
        const consents = await Consent.findAll({
            where: { country_code },
            attributes: ['id', 'title', 'type', 'opt-in_type', 'category'],
        });

        const response = { country_code, consents };

        res.json(response);
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.getConsents = getConsents;
