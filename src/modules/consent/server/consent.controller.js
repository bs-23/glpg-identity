const path = require('path');
const { Op } = require('sequelize');
const Consent = require('./consent.model');
const ConsentCategory = require('./consent-category.model');
const ConsentLanguage = require('./consent-language.model');
const ConsentCountry = require('./consent-country.model');
const validator = require('validator');
const _ = require('lodash');
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));

async function getConsents(req, res) {
    const response = new Response({}, []);

    try {
        let { country: country_iso2, locale: language_code } = req.query;

        if (!country_iso2) {
            response.errors.push(new CustomError('Invalid query parameter'));
            return res.status(400).send(response);
        }

        language_code = language_code || 'en';

        const consentCountries = await ConsentCountry.findAll({
            where: {
                country_iso2: {
                    [Op.or]: [
                        country_iso2.toUpperCase(),
                        country_iso2.toLowerCase(),
                    ],
                }
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


        const consentLangs = await Promise.all(consentCountries.map(async consentCountry => {

            return await ConsentLanguage.findAll({
                where: {
                    consent_id: consentCountry.consent_id,
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
                            model: ConsentCategory
                        }]
                    }
                ]
            });

        }));



        const result = await Promise.all(_.flatten(consentLangs).map( async consentLang => {


            const consentCountry = await ConsentCountry.findOne({
                where :
                {
                    country_iso2: {
                        [Op.or]: [
                            country_iso2.toUpperCase(),
                            country_iso2.toLowerCase(),
                        ],
                    },
                    consent_id : consentLang.consent_id

                }

            });
            return {
                id: consentLang.consent.id,
                title: consentLang.consent.title,
                rich_text: validator.unescape(consentLang.rich_text),
                slug: consentLang.consent.slug,
                opt_type: consentCountry.opt_type ,
                category: consentLang.consent.consent_category.type,
                category_title: consentLang.consent.consent_category.title,
                country_iso2: country_iso2,
                language_code: consentLang.language_code,
                purpose: consentLang.consent.purpose,
            }

        }));


        response.data = await result;

        res.json(response);
    } catch (err) {
        response.errors.push(new CustomError(err.message));
        res.status(500).send(response);
    }
}

exports.getConsents = getConsents;
