const path = require('path');
const _ = require('lodash');
const { Op } = require('sequelize');
const Consent = require('./consent.model');
const validator = require('validator');
const ConsentLocale = require('./consent-locale.model');
const ConsentCountry = require('./consent-country.model');
const ConsentCategory = require('./consent-category.model');
const HCPS = require(path.join(process.cwd(), 'src/modules/hcp/server/hcp_profile.model'));
const HcpConsents = require(path.join(process.cwd(), 'src/modules/hcp/server/hcp_consents.model'));
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
                preference: consentLang.consent.preference
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
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}



async function generateReport(req, res){
    const response = new Response({}, []);

    try{
        const hcps = await HCPS.findAll({
            attributes: ['email', 'first_name', 'last_name'],
            include: [{
                model: HcpConsents,
                as: 'hcpConsents',
                attributes: ['consent_id', 'response', 'consent_confirmed'],
                include: [{
                    model: Consent,
                    attributes: ['preference', 'legal_basis', 'created_at'],
                    include: [
                    {
                        model: ConsentCategory,
                        attributes: ['title', 'type']
                    },
                    {
                        model: ConsentCountry,
                        as: 'consent_country',
                        attributes: ['country_iso2', 'opt_type',]
                    }
                ]
                }],
            }],
        });

        // const consent_report = [];



        res.json(hcps);
    }
    catch(err){
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

exports.getConsents = getConsents;
exports.generateReport = generateReport;