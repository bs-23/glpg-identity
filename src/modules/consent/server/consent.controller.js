const path = require('path');
const { Op } = require('sequelize');
const Consent = require('./consent.model');
const ConsentCategory = require('./consent-category.model');
const ConsentLanguage = require('./consent_language.model');
const validator = require('validator');
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));

async function getConsents(req, res) {
    const response = new Response({}, []);

    try {
        const { country_lang } = req.query;

        if (!country_lang) {
            response.errors.push(new CustomError('Invalid query parameter'));
            return res.status(400).send(response);
        }

        let [country_iso2, language_code] = country_lang.split('_');
        language_code = language_code || 'en';

        const consentLangs = await ConsentLanguage.findAll({
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
                    model: Consent,
                    as: 'consent',
                    include: [{
                        model: ConsentCategory,
                    }]
                }
            ]
        });

        const result =  consentLangs.map(consentLang=> {
            return {
                id: consentLang.consent.id,
                title: consentLang.consent.title,
                rich_text: validator.unescape(consentLang.rich_text),
                slug: consentLang.consent.slug,
                opt_type: consentLang.consent.opt_type,
                category: consentLang.consent.consent_category.type,
                category_title: consentLang.consent.consent_category.title,
                country_iso2: consentLang.country_iso2,
                language_code: consentLang.language_code,
                purpose: consentLang.consent.purpose,
            }
        });

         response.data =  result;

        res.json(response);
    } catch (err) {
        response.errors.push(new CustomError(err.message));
        res.status(500).send(response);
    }
}

exports.getConsents = getConsents;
