const path = require('path');
const _ = require('lodash');
const { QueryTypes, Op } = require('sequelize');
const Sequelize = require('sequelize');
const Consent = require('./consent.model');
const validator = require('validator');
const ConsentLocale = require('./consent-locale.model');
const ConsentCountry = require('./consent-country.model');
const ConsentCategory = require('./consent-category.model');
const ConsentLanguage = require('./consent-locale.model');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const HCPS = require(path.join(process.cwd(), 'src/modules/hcp/server/hcp_profile.model'));
const User = require(path.join(process.cwd(), 'src/modules/user/server/user.model.js'));
const HcpConsents = require(path.join(process.cwd(), 'src/modules/hcp/server/hcp_consents.model'));
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));

function getTranslationViewmodels(translations) {
    return translations.map(t => ({
        id: t.id,
        locale: t.locale,
        rich_text: validator.unescape(t.rich_text)
    }));
}

async function getConsents(req, res) {
    const response = new Response({}, []);

    try {
        let { country_iso2, locale } = req.query;

        if (!country_iso2) {
            response.errors.push(new CustomError('Invalid query parameters'));
            return res.status(400).send(response);
        }

        locale = locale || 'en';

        const consentCountries = await ConsentCountry.findAll({
            where: {
                country_iso2: {
                    [Op.or]: [
                        country_iso2.toUpperCase(),
                        country_iso2.toLowerCase()
                    ]
                }
            }, include: [{
                model: Consent,
                as: 'consent',
                include: [{
                    model: ConsentCategory
                }]
            }]
        });

        const consentLocales = await Promise.all(consentCountries.map(async consentCountry => {
            return await ConsentLocale.findAll({
                where: {
                    consent_id: consentCountry.consent_id,
                    locale: {
                        [Op.or]: [
                            locale.toUpperCase(),
                            locale.toLowerCase()
                        ]
                    }
                }, include: [{
                    model: Consent,
                    as: 'consent',
                    include: [{
                        model: ConsentCategory
                    }]
                }]
            });
        }));

        const result = await Promise.all(_.flatten(consentLocales).map(async consentLang => {
            const consentCountry = await ConsentCountry.findOne({
                where: {
                    country_iso2: {
                        [Op.or]: [
                            country_iso2.toUpperCase(),
                            country_iso2.toLowerCase()
                        ]
                    },
                    consent_id: consentLang.consent_id
                }
            });

            return {
                id: consentLang.consent.id,
                title: consentLang.consent.title,
                rich_text: validator.unescape(consentLang.rich_text),
                slug: consentLang.consent.slug,
                opt_type: consentCountry.opt_type,
                category: consentLang.consent.consent_category.type,
                category_title: consentLang.consent.consent_category.title,
                country_iso2: country_iso2,
                locale: consentLang.locale,
                preference: consentLang.consent.preference
            }
        }));

        if (!result || !result.length) {
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

async function getConsentsReport(req, res) {
    const response = new Response({}, []);

    try {
        const page = req.query.page ? req.query.page - 1 : 0;
        const limit = 30;
        const codbase = req.query.codbase === undefined ? '' : req.query.codbase;
        const process_activity = req.query.process_activity === undefined ? '' : req.query.process_activity;
        const opt_type = req.query.opt_type === undefined ? '' : req.query.opt_type;
        const offset = page * limit;

        const orderBy = req.query.orderBy ? req.query.orderBy : '';
        const orderType = req.query.orderType ? req.query.orderType : '';
        const order = [];

        if (orderBy && orderType) {
            if (orderBy === 'first_name') order.push([HCPS, 'first_name', orderType]);
            if (orderBy === 'last_name') order.push([HCPS, 'last_name', orderType]);
            if (orderBy === 'email') order.push([HCPS, 'email', orderType]);

            if (orderBy === 'consent_type') order.push([Consent, ConsentCategory, 'title', orderType]);

            if (orderBy === 'opt_type') order.push([Consent, { model: ConsentCountry, as: 'consent_country' }, 'opt_type', orderType === 'ASC' ? 'DESC' : 'ASC']);

            if (orderBy === 'legal_basis') order.push([Consent, 'legal_basis', orderType]);
            if (orderBy === 'preferences') order.push([Consent, 'preference', orderType]);
            if (orderBy === 'date') order.push(['updated_at', orderType]);
        }
        order.push([HCPS, 'created_at', 'DESC']);
        order.push([HCPS, 'id', 'DESC']);

        const application_list = (await HCPS.findAll()).map(i => i.get("application_id"));

        const country_iso2_list_for_codbase = (await sequelize.datasyncConnector.query(`SELECT * FROM ciam.vwcountry`, { type: QueryTypes.SELECT })).filter(i => i.codbase === codbase).map(i => i.country_iso2);
        const countries_ignorecase_for_codbase = [].concat.apply([], country_iso2_list_for_codbase.map(i => ignoreCaseArray(i)));

        const country_iso2_list = req.user.type === 'admin' ? (await sequelize.datasyncConnector.query("SELECT * FROM ciam.vwcountry", { type: QueryTypes.SELECT })).map(i => i.country_iso2) : (await HCPS.findAll()).map(i => i.get("country_iso2"));
        const countries_ignorecase = [].concat.apply([], country_iso2_list.map(i => ignoreCaseArray(i)));


        const codbase_list_mapped_with_user_country_iso2_list = req.user.type !== 'admin' ? (await sequelize.datasyncConnector.query(`SELECT * FROM ciam.vwcountry`, { type: QueryTypes.SELECT })).filter(i => req.user.countries.includes(i.country_iso2)).map(i => i.codbase) : [];
        const country_iso2_list_for_user_countries_codbase = req.user.type !== 'admin' ? (await sequelize.datasyncConnector.query(`SELECT * FROM ciam.vwcountry`, { type: QueryTypes.SELECT })).filter(i => codbase_list_mapped_with_user_country_iso2_list.includes(i.codbase)).map(i => i.country_iso2) : [];
        const countries_ignorecase_for_user_countries_codbase = [].concat.apply([], country_iso2_list_for_user_countries_codbase.map(i => ignoreCaseArray(i)));


        const process_activities = (await ConsentCategory.findAll()).map(i => i.type);
        const opt_types = [...new Set((await ConsentCountry.findAll()).map(i => i.opt_type))];


        const consent_filter = {
            response: true,
            consent_confirmed: true,
            '$hcp_profile.application_id$': req.user.type === 'admin' ? { [Op.or]: application_list } : req.user.application_id,
            '$hcp_profile.country_iso2$': codbase ? { [Op.any]: [countries_ignorecase_for_codbase] } : req.user.type === 'admin' ? { [Op.any]: [countries_ignorecase] } : countries_ignorecase_for_user_countries_codbase,
            '$consent.consent_category.type$': process_activity ? { [Op.eq]: process_activity } : { [Op.or]: process_activities },
            '$consent.consent_country.country_iso2$': { [Op.eq]: Sequelize.col('hcp_profile.country_iso2') },
            '$consent.consent_country.opt_type$': opt_type ? { [Op.eq]: opt_type } : { [Op.or]: opt_types }
        };

        const hcp_consents = await HcpConsents.findAll({
            where: consent_filter,
            include: [
                {
                    model: HCPS,
                    attributes: { exclude: ['password', 'created_by', 'updated_by'] },
                },
                {
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
                }
            ],
            attributes: ['consent_id', 'response', 'consent_confirmed', 'updated_at'],
            offset,
            limit,
            order: order,
            subQuery: false,
        });

        hcp_consents.forEach(hcp_consent => {
            hcp_consent.dataValues.consent_id = hcp_consent.consent_id;
            hcp_consent.dataValues.response = hcp_consent.response;
            hcp_consent.dataValues.consent_confirmed = hcp_consent.consent_confirmed;
            hcp_consent.dataValues.legal_basis = hcp_consent.consent.legal_basis;
            hcp_consent.dataValues.given_date = hcp_consent.updated_at;
            hcp_consent.dataValues.preference = hcp_consent.consent.preference;
            hcp_consent.dataValues.title = hcp_consent.consent.consent_category.title;
            hcp_consent.dataValues.type = hcp_consent.consent.consent_category.type;
            hcp_consent.dataValues.country_iso2 = hcp_consent.consent.consent_country[0].country_iso2;
            hcp_consent.dataValues.opt_type = hcp_consent.consent.consent_country[0].opt_type;

            delete hcp_consent.dataValues['consent'];
        });

        const total_consents = await HcpConsents.count({
            where: consent_filter,
            include: [
                {
                    model: HCPS,
                },
                {
                    model: Consent,
                    include: [
                        {
                            model: ConsentCategory,
                        },
                        {
                            model: ConsentCountry,
                            as: 'consent_country',
                        }
                    ]
                }
            ],
        });

        const data = {
            hcp_consents: hcp_consents,
            page: page + 1,
            limit,
            total: total_consents,
            start: limit * page + 1,
            end: offset + limit > total_consents ? total_consents : offset + limit,
            codbase: codbase ? codbase : '',
            process_activity: process_activity ? process_activity : '',
            opt_type: opt_type ? opt_type : '',
            countries: req.user.type === 'admin' ? [...new Set(country_iso2_list)] : req.user.countries,
            orderBy: orderBy,
            orderType: orderType,
        };

        response.data = data;
        res.json(response);
    }
    catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getDatasyncConsentsReport(req, res) {
    const response = new Response({}, []);

    try {
        const page = req.query.page ? req.query.page - 1 : 0;
        const limit = 30;
        const codbase = req.query.codbase === undefined ? '' : req.query.codbase;
        // const process_activity = req.query.process_activity === undefined ? '' : req.query.process_activity;
        // const opt_type = req.query.opt_type === undefined ? '' : req.query.opt_type;
        const offset = page * limit;

        async function getCountryIso2() {
            const user_codbase_list_for_iso2 = (await sequelize.datasyncConnector.query(
                `SELECT * FROM ciam.vwcountry where ciam.vwcountry.country_iso2 = ANY($countries);`,
                {
                    bind: {
                        countries: req.user.countries
                    },
                    type: QueryTypes.SELECT
                }
            )).map(i => i.codbase);

            const user_country_iso2_list = (await sequelize.datasyncConnector.query(
                `SELECT * FROM ciam.vwcountry where ciam.vwcountry.codbase = ANY($codbases);`,
                {
                    bind: {
                        codbases: user_codbase_list_for_iso2
                    },
                    type: QueryTypes.SELECT
                }
            )).map(i => i.country_iso2);

            return user_country_iso2_list;
        }

        const country_iso2_list_for_codbase = (await sequelize.datasyncConnector.query(
            `SELECT * FROM ciam.vwcountry WHERE ciam.vwcountry.codbase = $codbase;`,
            {
                type: QueryTypes.SELECT,
                bind: { codbase: codbase }
            }
        )).map(i => i.country_iso2);


        const country_iso2_list = await getCountryIso2();

        const orderBy = req.query.orderBy ? req.query.orderBy : '';
        const orderType = req.query.orderType && req.query.orderType.toLowerCase() === "desc" ? "DESC" : "ASC";
        let sortBy = 'content_type';

        if (orderBy && orderType) {
            if (orderBy === 'name') sortBy = 'ciam.vw_veeva_consent_master.account_name';
            if (orderBy === 'email') sortBy = 'ciam.vw_veeva_consent_master.channel_value';
            // if(orderBy === 'consent_type') order.push([Consent, ConsentCategory, 'title', orderType]);

            if (orderBy === 'opt_type') sortBy = 'ciam.vw_veeva_consent_master.opt_type';

            // if(orderBy === 'legal_basis') order.push([Consent, 'legal_basis', orderType]);
            if (orderBy === 'preferences') sortBy = 'ciam.vw_veeva_consent_master.content_type';
            if (orderBy === 'date') sortBy = 'ciam.vw_veeva_consent_master.capture_datetime';
        }

        const hcp_consents = await sequelize.datasyncConnector.query(
            `SELECT
                account_name,
                content_type,
                opt_type,
                capture_datetime,
                onekeyid,
                uuid_mixed,
                country_code,
                double_opt_in,
                uuid_mixed,
                channel_value
            FROM
                ciam.vw_veeva_consent_master
            WHERE
                ciam.vw_veeva_consent_master.country_code = ANY($countries)
            ORDER BY
                ${sortBy} ${orderType}
            offset $offset
            limit $limit;`
            , {
                bind: {
                    countries: codbase ? country_iso2_list_for_codbase : country_iso2_list,
                    offset: offset,
                    limit: limit
                },
                type: QueryTypes.SELECT
            });

        const total_consents = (await sequelize.datasyncConnector.query(
            `SELECT
                COUNT(*)
            FROM
                ciam.vw_veeva_consent_master
            WHERE
            ciam.vw_veeva_consent_master.country_code = ANY($countries);`
            , {
                bind: {
                    countries: codbase ? country_iso2_list_for_codbase : country_iso2_list
                },
                type: QueryTypes.SELECT
            }))[0];


        hcp_consents.forEach(hcp_consent => {
            hcp_consent.name = hcp_consent.account_name;
            hcp_consent.first_name = hcp_consent.firstname;
            hcp_consent.last_name = hcp_consent.lastname;
            hcp_consent.email = hcp_consent.channel_value;
            hcp_consent.opt_type = hcp_consent.opt_type === 'Opt_In_vod' ? hcp_consent.double_opt_in ? 'double-opt-in' : 'single-opt-in' : 'opt-out';
            hcp_consent.legal_basis = 'consent';
            hcp_consent.preference = hcp_consent.content_type;
            hcp_consent.given_date = hcp_consent.capture_datetime;

            delete hcp_consent['account_name'];
            delete hcp_consent['firstname'];
            delete hcp_consent['lastname'];
            delete hcp_consent['channel_value'];
            delete hcp_consent['content_type'];
            delete hcp_consent['capture_datetime'];
            delete hcp_consent['double_opt_in'];
        });

        const data = {
            hcp_consents: hcp_consents,
            page: page + 1,
            limit,
            total: total_consents.count,
            start: limit * page + 1,
            end: offset + limit > total_consents.count ? total_consents.count : offset + limit,
            codbase: codbase ? codbase : '',
            // process_activity: process_activity ? process_activity : '',
            // opt_type: opt_type ? opt_type : '',
            countries: req.user.type === 'admin' ? [...new Set(country_iso2_list)] : req.user.countries,
            orderBy: orderBy,
            orderType: orderType,
        };


        response.data = data;
        res.json(response);
    }
    catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getAllProcessActivities(req, res) {
    try {
        const process_activities = await ConsentCategory.findAll();
        res.json(process_activities);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getAllOptTypes(req, res) {
    try {
        const opt_types = new Set((await ConsentCountry.findAll()).map(i => i.opt_type));
        res.json([...opt_types]);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getUserConsents(req, res) {
    const response = new Response({}, []);
    const userOneKeyID = req.params.id;

    try {
        const userConsents = await sequelize.datasyncConnector.query(`
            SELECT *
            FROM ciam.vw_veeva_consent_master
            where ciam.vw_veeva_consent_master.onekeyid = $userOneKeyID;`,
            {
                bind: { userOneKeyID: userOneKeyID },
                type: QueryTypes.SELECT
            }
        );

        if (!userConsents) return res.json([]);

        let id = 0;

        userConsents.forEach(consent => {
            consent.id = ++id;
            consent.title = consent.default_consent_text_vod ? consent.default_consent_text_vod : '';
            consent.rich_text = consent.disclaimer_text_vod ? consent.disclaimer_text_vod : '';
            consent.given_time = consent.capture_datetime;
            consent.opt_type = consent.opt_type === 'Opt_In_vod' ? consent.double_opt_in ? 'double-opt-in' : 'single-opt-in' : 'opt-out';
        });

        response.data = userConsents;

        res.json(response);
    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getConsentCatogories(req, res) {
    try {
        const consentCategories = await ConsentCategory.findAll({
            attributes: { exclude: ['created_at', 'updated_at'] }
        });
        res.json(consentCategories);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getCdpConsents(req, res) {
    try {
        let { translations, category } = req.query;

        const inclusions = [{
            model: User,
            as: 'createdByUser',
            attributes: ['id', 'first_name', 'last_name'],
        }];

        if (category === 'true') {
            inclusions.push({
                model: ConsentCategory,
                as: 'consent_category',
                attributes: ['id', 'title', 'type']
            });
        }

        const consents = await Consent.findAll({
            include: inclusions,
            attributes: { exclude: ['category_id', 'created_by'] }
        });

        translations === 'true' && await Promise.all(consents.map(async consent => {
            const consentTranslations = await ConsentLanguage.findAll({
                where: {
                    consent_id: consent.id
                }
            });
            consent.dataValues.translations = getTranslationViewmodels(consentTranslations);
        }));

        res.json(consents);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getCdpConsent(req, res) {
    try {
        if (!req.params.id) {
            return res.status(400).send('Invalid request.');
        }

        const consent = await Consent.findOne({
            where: {
                id: req.params.id
            },
            include: [
                {
                    model: User,
                    as: 'createdByUser',
                    attributes: ['id', 'first_name', 'last_name'],
                },
                {
                    model: ConsentCategory,
                    as: 'consent_category',
                    attributes: ['id', 'title', 'type']
                },
                {
                    model: ConsentCountry,
                    as: 'consent_country'
                }
            ],
            attributes: { exclude: ['category_id'] }
        });

        if (!consent) {
            res.status(404).send('Consent not found');
        }

        const { consent_country, ...otherProps } = consent.dataValues;
        const data = { ...otherProps, countries: consent_country };

        const translations = await ConsentLanguage.findAll({
            where: { consent_id: consent.id }
        });

        data.translations = getTranslationViewmodels(translations);

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function createConsent(req, res) {
    try {
        let { category_id, title, legal_basis, is_active, preference, translations } = req.body;

        if (!category_id || !title || !legal_basis) {
            return res.status(400).send('Invalid request.');
        }

        if (!translations || !translations.length) {
            return res.status(400).send('Must provide at least one translation.');
        }

        is_active = !!is_active;

        if (preference && preference.length) {
            const preferences = ['Galapagos Terms of Use', 'Promotional email marketing'];
            if (!preferences.includes(preference)) return res.status(400).send('Invalid Preference.');
        }

        const consentCategory = await ConsentCategory.findOne({ where: { id: category_id } });

        if (!consentCategory) {
            return res.status(400).send('Invalid Consent Category Id.');
        }

        const [consent, created] = await Consent.findOrCreate({
            where: {
                title
            },
            defaults: {
                category_id,
                title,
                slug: title,
                legal_basis,
                is_active,
                preference,
                created_by: req.user.id
            },
            attributes: { exclude: ['created_at', 'updated_at'] }
        });

        if (!created && consent) {
            return res.status(400).send('Consent with same Title already exists.');
        }

        const data = { ...consent.dataValues };

        if (created) {
            data.translations = [];
            await Promise.all(translations
                .filter(translation => translation.country_iso2 && translation.lang_code && translation.rich_text)
                .map(async (translation) => {
                    const locale = `${translation.lang_code.toLowerCase()}_${translation.country_iso2.toUpperCase()}`;
                    const [consentTransation, translationCreated] = await ConsentLanguage.findOrCreate({
                        where: {
                            consent_id: consent.id,
                            locale: {
                                [Op.iLike]: locale
                            }
                        },
                        defaults: {
                            locale: locale,
                            rich_text: translation.rich_text,
                            consent_id: consent.id
                        }
                    });

                    if (translationCreated) {
                        data.translations.push(consentTransation);
                    } else {
                        console.error('Create Translation failed: ', translation);
                    }
                })
            );
        }

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function updateCdpConsent(req, res) {
    try {
        const { category_id, title, legal_basis, is_active, preference, translations } = req.body;

        const id = req.params.id;
        if (!id) {
            return res.status(400).send('Invalid request.');
        }

        if (category_id) {
            const consentCategory = await ConsentCategory.findOne({ where: { id: category_id } });
            if (!consentCategory) {
                return res.status(400).send('Invalid Consent Category Id.');
            }
        }

        if (title) {
            const consentWithSameTitle = await Consent.findOne({
                where: {
                    title: title,
                    id: { [Op.ne]: id }
                }
            });
            if (consentWithSameTitle) {
                return res.status(400).send('Another Consent with same Title exists.');
            }
        }

        const consent = await Consent.findOne({ where: { id: id } });

        if (!consent) {
            return res.status(404).send('Consent not found.');
        }

        await consent.update({
            category_id,
            title,
            slug: title,
            legal_basis,
            is_active,
            preference
        });

        await ConsentLanguage.destroy({ where: { consent_id: consent.id } });

        if (translations) {
            await Promise.all(translations
                .filter(translation => translation.country_iso2 && translation.lang_code && translation.rich_text)
                .map(async (translation) => {
                    const locale = `${translation.lang_code.toLowerCase()}_${translation.country_iso2.toUpperCase()}`;
                    const [consentTransation, translationCreated] = await ConsentLanguage.findOrCreate({
                        where: {
                            consent_id: consent.id,
                            locale: locale
                        },
                        defaults: {
                            locale: locale,
                            rich_text: translation.rich_text,
                            consent_id: consent.id
                        }
                    });

                    if (!translationCreated) {
                        console.error('Create Translation failed: ', translation);
                    }
                })
            );
        }

        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function deleteCdpConsent(req, res) {
    try {
        if (!req.params.id) {
            return res.status(400).send('Invalid request.');
        }

        const consent = await Consent.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!consent) {
            res.status(404).send('Consent not found');
        }

        await ConsentCountry.destroy({ where: { consent_id: consent.id } });
        await ConsentLanguage.destroy({ where: { consent_id: consent.id } });
        await consent.destroy();

        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getCountryConsents(req, res) {
    try {
        const countryConsents = await ConsentCountry.findAll({
            include: [{
                model: Consent,
                as: 'consent',
                attributes: { exclude: ['created_at', 'updated_at'] }
            }]
        });

        if (!countryConsents || countryConsents.length < 1) {
            return res.status(400).send('Country Consents not found.');
        }

        await Promise.all(countryConsents.map(async (countryConsent) => {
            const consentTranslations = await ConsentLanguage.findAll({
                where: { consent_id: countryConsent.consent_id },
                attributes: { exclude: ['consent_id', 'created_at', 'updated_at'] }
            });
            countryConsent.dataValues.consent.dataValues.translations = getTranslationViewmodels(consentTranslations);
        }));

        res.json(countryConsents);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function assignConsentToCountry(req, res) {
    try {
        const { consent_id, country_iso2, opt_type } = req.body;

        if (!consent_id || !country_iso2 || !opt_type) {
            return res.status(400).send('Invalid request.');
        }

        const availableOptTypes = ConsentCountry.rawAttributes.opt_type.values;
        if (!availableOptTypes.includes(opt_type))
            return res.status(400).send('Invalid Opt Type');

        const existingCountryConsent = await ConsentCountry.findOne({
            where: {
                consent_id: consent_id,
                country_iso2: {
                    [Op.iLike]: country_iso2
                }
            }
        });

        if (existingCountryConsent) {
            return res.status(400).send('Country-Consent association already exists');
        }

        const consent = await Consent.findOne({ where: { id: consent_id } });

        if (!consent) {
            return res.status(400).send('Consent not found.');
        }

        const translations = await ConsentLanguage.findAll({
            where: { consent_id: consent.id }
        });

        consent.dataValues.translations = getTranslationViewmodels(translations);

        const createdCountryConsent = await ConsentCountry.create({
            consent_id,
            country_iso2: country_iso2.toUpperCase(),
            opt_type
        });

        createdCountryConsent.dataValues.consent = consent;

        res.json(createdCountryConsent);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function updateCountryConsent(req, res) {
    try {
        const id = req.params.id;
        const optType = req.body.opt_type;

        if (!id || !optType) return res.status(400).send('Invalid request.');

        const consentCountry = await ConsentCountry.findOne({ where: { id } });

        if (!consentCountry) return res.status(404).send('Country-Consent association does noit exist.');

        await consentCountry.update({
            opt_type: optType
        });

        res.json(consentCountry);

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function deleteCountryConsent(req, res) {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).send('Invalid request.');
        }

        await ConsentCountry.destroy({ where: { id } });

        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getConsents = getConsents;
exports.getConsentsReport = getConsentsReport;
exports.getDatasyncConsentsReport = getDatasyncConsentsReport;
exports.getAllProcessActivities = getAllProcessActivities;
exports.getAllOptTypes = getAllOptTypes;
exports.getUserConsents = getUserConsents;
exports.getConsentCatogories = getConsentCatogories;
exports.getCdpConsents = getCdpConsents;
exports.getCdpConsent = getCdpConsent;
exports.createConsent = createConsent;
exports.deleteCdpConsent = deleteCdpConsent;
exports.updateCdpConsent = updateCdpConsent;
exports.getCountryConsents = getCountryConsents;
exports.assignConsentToCountry = assignConsentToCountry;
exports.updateCountryConsent = updateCountryConsent;
exports.deleteCountryConsent = deleteCountryConsent;
