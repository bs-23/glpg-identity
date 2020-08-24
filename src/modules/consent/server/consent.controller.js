const path = require('path');
const _ = require('lodash');
const { Op } = require('sequelize');
const Consent = require('./consent.model');
const validator = require('validator');
const ConsentLocale = require('./consent-locale.model');
const ConsentCountry = require('./consent-country.model');
const ConsentCategory = require('./consent-category.model');
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));

async function getConsents(req, res) {
    const response = new Response({}, []);

    try {
        let { country_iso2, locale } = req.query;

        if (!country_iso2) {
            response.errors.push(new CustomError('Invalid query parameters'));
            return res.status(400).send(response);
        }

        locale = locale || 'en';

        const consentCountries = await ConsentCountry.findAll({where: {
            country_iso2: {
                [Op.or]: [
                    country_iso2.toUpperCase(),
                    country_iso2.toLowerCase()
                ]
            }}, include: [{
                model: Consent,
                as: 'consent',
                include: [{
                    model: ConsentCategory
                }]
            }]
        });

        const consentLocales = await Promise.all(consentCountries.map(async consentCountry => {
            return await ConsentLocale.findAll({where: {
                consent_id: consentCountry.consent_id,
                locale: {
                    [Op.or]: [
                        locale.toUpperCase(),
                        locale.toLowerCase()
                    ]
                }}, include: [{
                    model: Consent,
                    as: 'consent',
                    include: [{
                        model: ConsentCategory
                    }]
                }]
            });
        }));

        const result = await Promise.all(_.flatten(consentLocales).map( async consentLang => {
            const consentCountry = await ConsentCountry.findOne({where: {
                country_iso2: {
                    [Op.or]: [
                        country_iso2.toUpperCase(),
                        country_iso2.toLowerCase()
                    ]
                },
                consent_id : consentLang.consent_id
            }});

            return {
                id: consentLang.consent.id,
                title: consentLang.consent.title,
                rich_text: validator.unescape(consentLang.rich_text),
                slug: consentLang.consent.slug,
                opt_type: consentCountry.opt_type ,
                category: consentLang.consent.consent_category.type,
                category_title: consentLang.consent.consent_category.title,
                country_iso2: country_iso2,
                locale: consentLang.locale,
                purpose: consentLang.consent.purpose
            }
        }));

        if(!result || !result.length) {
            response.data = [];
            return res.status(204).send(response);
        }

        response.data = result;

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getConsents = getConsents;
