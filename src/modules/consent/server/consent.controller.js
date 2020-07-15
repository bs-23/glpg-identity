const path = require('path');
const { Op } = require('sequelize');
const Consent = require('./consent.model');
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));

async function getConsents(req, res) {
    const response = new Response({}, []);
    try {
        const { country_lang } = req.query;
        let [country_iso2, language_code] = country_lang.split('_');
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

        response.data = { consents };

        res.json(response);
    } catch (err) {
        response.errors.push(new CustomError(err.message, '', '', err));
        res.status(500).send(response);
    }
}

exports.getConsents = getConsents;
