const path = require('path');
const { Op } = require('sequelize');
const CountryConsent = require('./country-consent.model');
const Consent = require('./consent.model');
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));

async function getConsents(req, res) {
    const response = new Response({}, []);
    
    try {
        const { country_lang } = req.query;

        if(!country_lang) {
            response.errors.push(new CustomError('Invalid query parameter', '', '', new Error().stack));
            return res.status(400).send(response);
        }
        
        let [country_iso2, language_code] = country_lang.split('_');
        language_code = language_code || 'en';

        const country_consents = await CountryConsent.findAll({
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
            include: [
                {
                    model: Consent
                }
            ]
        });

        const result = country_consents.map( country_consent => {
            return {
                id: country_consent.id,
                title: country_consent.consent.title,
                slug: country_consent.slug,
                type: country_consent.type,
                opt_type: country_consent.opt_type,
                category: country_consent.category,
                category_title: country_consent.category_title,
                country_iso2: country_consent.country_iso2,
                language_code: country_consent.language_code,
                purpose: country_consent.purpose,
            }
        });

        response.data = result;

        res.json(response);
    } catch (err) {
        response.errors.push(new CustomError(err.message, '', '', err));
        res.status(500).send(response);
    }
}

exports.getConsents = getConsents;
