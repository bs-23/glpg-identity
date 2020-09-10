const path = require('path');
const _ = require('lodash');
const { QueryTypes, Op } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const Consent = require('./consent.model');
const validator = require('validator');
const ConsentLocale = require('./consent-locale.model');
const ConsentCountry = require('./consent-country.model');
const ConsentCategory = require('./consent-category.model');
const Application = require('../../application/server/application.model');
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

function ignoreCaseArray(str) {
    return [str.toLowerCase(), str.toUpperCase(), str.charAt(0).toLowerCase() + str.charAt(1).toUpperCase(), str.charAt(0).toUpperCase() + str.charAt(1).toLowerCase()];
}

async function getConsentsReport(req, res){
    const response = new Response({}, []);

    try{
        const page = req.query.page ? req.query.page - 1 : 0;
        const limit = 15;
        const codbase = req.query.codbase === undefined ? '' : req.query.codbase;
        const process_activity = req.query.process_activity === undefined ? '' : req.query.process_activity;
        const offset = page * limit;

        const application_list = (await HCPS.findAll()).map(i => i.get("application_id"));

        const country_iso2_list_for_codbase = (await sequelize.datasyncConnector.query(`SELECT * FROM ciam.vwcountry`, { type: QueryTypes.SELECT })).filter(i => i.codbase === codbase).map(i => i.country_iso2);
        const countries_ignorecase_for_codbase = [].concat.apply([], country_iso2_list_for_codbase.map(i => ignoreCaseArray(i)));

        const country_iso2_list = req.user.type === 'admin' ? (await sequelize.datasyncConnector.query("SELECT * FROM ciam.vwcountry", { type: QueryTypes.SELECT })).map(i => i.country_iso2) : (await HCPS.findAll()).map(i => i.get("country_iso2"));
        const countries_ignorecase = [].concat.apply([], country_iso2_list.map(i => ignoreCaseArray(i)));


        const codbase_list_mapped_with_user_country_iso2_list = req.user.type !== 'admin' ? (await sequelize.datasyncConnector.query(`SELECT * FROM ciam.vwcountry`, { type: QueryTypes.SELECT })).filter(i => req.user.countries.includes(i.country_iso2)).map(i => i.codbase) : [];
        const country_iso2_list_for_user_countries_codbase = req.user.type !== 'admin' ? (await sequelize.datasyncConnector.query(`SELECT * FROM ciam.vwcountry`, { type: QueryTypes.SELECT })).filter(i => codbase_list_mapped_with_user_country_iso2_list.includes(i.codbase)).map(i => i.country_iso2) : [];
        const countries_ignorecase_for_user_countries_codbase = [].concat.apply([], country_iso2_list_for_user_countries_codbase.map(i => ignoreCaseArray(i)));


        const process_activities = (await ConsentCategory.findAll()).map(i => i.type);

        const hcp_filter = {
            application_id: req.user.type === 'admin' ? { [Op.or]: application_list } : req.user.application_id,
            country_iso2: codbase ? { [Op.any]: [countries_ignorecase_for_codbase] } : req.user.type === 'admin' ? { [Op.any]: [countries_ignorecase] } : countries_ignorecase_for_user_countries_codbase,
            '$hcpConsents.response$': true,
            '$hcpConsents.consent_confirmed$': true,
            '$hcpConsents.consent.consent_category.type$': process_activity ? { [Op.eq]: process_activity } : { [Op.or]: process_activities }
        };

        const hcps = await HCPS.findAll({
            where: hcp_filter,
            include: [
                {
                    model: Application,
                    as: 'application',
                    attributes: ['name'],
                },
                {
                model: HcpConsents,
                as: 'hcpConsents',
                attributes: ['consent_id', 'response', 'consent_confirmed'],
                include: [{
                    model: Consent,
                    attributes: ['preference', 'legal_basis', 'updated_at'],
                    include: [
                    {
                        model: ConsentCategory,
                        attributes: ['title', 'type'],
                    },
                    {
                        model: ConsentCountry,
                        as: 'consent_country',
                        attributes: ['country_iso2', 'opt_type'],
                    }
                ]
                }],
            }],
            attributes: ['email', 'first_name', 'last_name', 'created_at'],
            offset,
            limit,
            subQuery: false,
            order: [
                ['created_at', 'DESC'],
                ['id', 'ASC']
            ]
        });

        
        hcps.forEach( hcp => {
            const consents = hcp.hcpConsents.map( hcpConsent => {
                const consent = {
                    consent_id: hcpConsent.consent_id,
                    response: hcpConsent.response,
                    consent_confirmed: hcpConsent.consent_confirmed,
                    preference: hcpConsent.consent.preference,
                    legal_basis: hcpConsent.consent.legal_basis,
                    given_date: hcpConsent.consent.updated_at,
                    title: hcpConsent.consent.consent_category.title,
                    type: hcpConsent.consent.consent_category.type,
                    country_iso2: hcpConsent.consent.consent_country.country_iso2,
                    opt_type: hcpConsent.consent.consent_country.opt_type,
                };

                return consent;
            });
            hcp.dataValues.consents = consents;
            delete hcp.dataValues['hcpConsents'];
        });


        // const totalUser = await HCPS.count({    //counting total data for pagintaion
        //     where: hcp_filter
        // });

        const totalUser = hcps.length;

        const data = {
            users: hcps,
            page: page + 1,
            limit,
            total: totalUser,
            start: limit * page + 1,
            end: offset + limit > totalUser ? totalUser : offset + limit,
            codbase: codbase ? codbase : '',
            process_activity: process_activity ? process_activity : '',
            countries: req.user.type === 'admin' ? [...new Set(country_iso2_list)] : req.user.countries
        };

        response.data = data;
        res.json(response);
    }
    catch(err){
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getAllProcessActivities(req, res) {
    try{
        const process_activities = await ConsentCategory.findAll();
        res.json(process_activities);
    }
    catch(err){
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getConsents = getConsents;
exports.getConsentsReport = getConsentsReport;
exports.getAllProcessActivities = getAllProcessActivities;