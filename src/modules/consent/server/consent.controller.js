const path = require('path');
const { Op } = require('sequelize');
const Consent = require('./consent.model');
const ConsentCategory = require('./consent-category.model');
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
            include: [
                {
                    model: ConsentCategory
                }
            ]
        });

        const result = consents.map( consent => {
            return {
                id: consent.id,
                title: consent.title,
                rich_text: consent.rich_text,
                slug: consent.slug,
                opt_type: consent.opt_type,
                category: consent.consent_category.type,
                category_title: consent.consent_category.title,
                country_iso2: consent.country_iso2,
                language_code: consent.language_code,
                purpose: consent.purpose,
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
