// const path = require('path');
// const _ = require('lodash');
// const { QueryTypes, Op } = require('sequelize');
// const Sequelize = require('sequelize');
// const validator = require('validator');
// const uniqueSlug = require('unique-slug');

// const Consent = require('./consent.model');
// const ConsentLocale = require('./consent-locale.model');
// const ConsentCountry = require('./consent-country.model');
// const ConsentCategory = require('./consent-category.model');
// const ConsentLanguage = require('./consent-locale.model');
// const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
// const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model.js'));
// const HCPS = require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-profile.model'));
// const HcpConsents = require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-consents.model'));
// const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));
// const { getUserPermissions } = require(path.join(process.cwd(), 'src/modules/platform/user/server/permission/permissions.js'));
// const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));

// const convertToSlug = string => string.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

// const makeCustomSlug = (title) => {
//     const code = uniqueSlug(`${title}`);
//     if (title.length > 50) return convertToSlug(`${title.substring(0, 50)} ${code}`);
//     return convertToSlug(`${title} ${code}`);
// };

// function getTranslationViewmodels(translations) {
//     return translations.map(t => ({
//         id: t.id,
//         locale: t.locale,
//         rich_text: validator.unescape(t.rich_text)
//     }));
// }

// async function getConsents(req, res) {
//     const response = new Response({}, []);

//     try {
//         let { country_iso2, locale } = req.query;

//         if (!country_iso2) {
//             response.errors.push(new CustomError('Invalid query parameters'));
//             return res.status(400).send(response);
//         }

//         locale = locale || 'en';

//         const consentCountries = await ConsentCountry.findAll({
//             where: {
//                 country_iso2: {
//                     [Op.or]: [
//                         country_iso2.toUpperCase(),
//                         country_iso2.toLowerCase()
//                     ]
//                 },
//                 "$consent.is_active$": true
//             }, include: [{
//                 model: Consent,
//                 as: 'consent',
//                 include: [{
//                     model: ConsentCategory
//                 }]
//             }]
//         });

//         const consentLocales = await Promise.all(consentCountries.map(async consentCountry => {
//             return await ConsentLocale.findAll({
//                 where: {
//                     consent_id: consentCountry.consent_id,
//                     locale: {
//                         [Op.iLike]: `%${locale}`
//                     }
//                 }, include: [{
//                     model: Consent,
//                     as: 'consent',
//                     include: [{
//                         model: ConsentCategory
//                     }]
//                 }]
//             });
//         }));

//         const result = await Promise.all(_.flatten(consentLocales).map(async consentLang => {
//             const consentCountry = await ConsentCountry.findOne({
//                 where: {
//                     country_iso2: {
//                         [Op.or]: [
//                             country_iso2.toUpperCase(),
//                             country_iso2.toLowerCase()
//                         ]
//                     },
//                     consent_id: consentLang.consent_id
//                 }
//             });

//             return {
//                 id: consentLang.consent.id,
//                 preference: consentLang.consent.preference,
//                 slug: consentLang.consent.slug,
//                 legal_basis: consentLang.consent.legal_basis,
//                 rich_text: validator.unescape(consentLang.rich_text),
//                 category_title: consentLang.consent.consent_category.title,
//                 category_slug: consentLang.consent.consent_category.slug,
//                 country_iso2: country_iso2,
//                 locale: consentLang.locale,
//                 locale_id: consentLang.id,
//                 opt_type: consentCountry.opt_type
//             }
//         }));

//         if (!result || !result.length) {
//             response.data = [];
//             return res.status(204).send(response);
//         }

//         response.data = result;

//         res.json(response);
//     } catch (err) {
//         console.error(err);
//         response.errors.push(new CustomError('Internal server error', 500));
//         res.status(500).send(response);
//     }
// }

// function ignoreCaseArray(str) {
//     return [str.toLowerCase(), str.toUpperCase(), str.charAt(0).toLowerCase() + str.charAt(1).toUpperCase(), str.charAt(0).toUpperCase() + str.charAt(1).toLowerCase()];
// }

// async function getCdpConsentsReport(req, res) {
//     const response = new Response({}, []);

//     try {
//         const page = req.query.page ? req.query.page - 1 : 0;
//         const limit = 30;
//         const codbase = req.query.codbase === undefined ? '' : req.query.codbase;
//         const opt_type = req.query.opt_type === undefined ? '' : req.query.opt_type;
//         const offset = page * limit;

//         const orderBy = req.query.orderBy ? req.query.orderBy : '';
//         const orderType = req.query.orderType ? req.query.orderType : '';
//         const order = [];

//         if (orderBy && orderType) {
//             if (orderBy === 'first_name') order.push([HCPS, 'first_name', orderType]);
//             if (orderBy === 'last_name') order.push([HCPS, 'last_name', orderType]);
//             if (orderBy === 'email') order.push([HCPS, 'email', orderType]);

//             if (orderBy === 'consent_type') order.push([Consent, ConsentCategory, 'title', orderType]);

//             if (orderBy === 'opt_type') order.push([Consent, { model: ConsentCountry, as: 'consent_country' }, 'opt_type', orderType === 'ASC' ? 'DESC' : 'ASC']);

//             if (orderBy === 'legal_basis') order.push([Consent, 'legal_basis', orderType]);
//             if (orderBy === 'preferences') order.push([Consent, 'preference', orderType]);
//             if (orderBy === 'date') order.push(['updated_at', orderType]);
//         }
//         order.push([HCPS, 'created_at', 'DESC']);
//         order.push([HCPS, 'id', 'DESC']);

//         const countries = await sequelize.datasyncConnector.query(`SELECT * FROM ciam.vwcountry`, { type: QueryTypes.SELECT });

//         const userCountriesApplication = await getUserPermissions(req.user.id);
//         const userPermittedCodbases = countries.filter(i => userCountriesApplication[1].includes(i.country_iso2)).map(i => i.codbase);
//         const userPermittedCountries = countries.filter(i => userPermittedCodbases.includes(i.codbase)).map(i => i.country_iso2);
//         const userPermittedApplications = userCountriesApplication[0].map(app => app.id);

//         const application_list = (await HCPS.findAll()).map(i => i.get("application_id"));


//         const country_iso2_list_for_codbase = countries.filter(i => i.codbase === codbase).map(i => i.country_iso2);
//         const countries_with_ignorecase = [].concat.apply([], country_iso2_list_for_codbase.map(i => ignoreCaseArray(i)));

//         const codbase_list = countries.filter(i => userPermittedCountries.includes(i.country_iso2)).map(i => i.codbase);
//         const country_iso2_list = countries.filter(i => codbase_list.includes(i.codbase)).map(i => i.country_iso2);
//         const country_iso2_list_with_ignorecase = [].concat.apply([], country_iso2_list.map(i => ignoreCaseArray(i)));

//         const opt_types = ['single-opt-in', 'double-opt-in', 'soft-opt-in', 'opt-out'];

//         const consent_filter = {
//             'opt_type': opt_type ? { [Op.eq]: opt_type } : { [Op.or]: opt_types },
//             [Op.or]: [{ 'consent_confirmed': true }, { 'opt_type': 'opt-out' }],
//             '$hcp_profile.application_id$': req.user.type === 'admin' ? { [Op.or]: application_list } : userPermittedApplications,
//             '$hcp_profile.country_iso2$': codbase ? { [Op.any]: [countries_with_ignorecase] } : { [Op.any]: [country_iso2_list_with_ignorecase] },
//         };

//         const hcp_consents = await HcpConsents.findAll({
//             where: consent_filter,
//             include: [
//                 {
//                     model: HCPS,
//                     attributes: { exclude: ['password', 'created_by', 'updated_by'] }
//                 },
//                 {
//                     model: Consent,
//                     attributes: ['preference', 'legal_basis', 'updated_at'],
//                     include: [
//                         {
//                             model: ConsentCategory,
//                             attributes: ['title', 'slug']
//                         }
//                     ]
//                 }
//             ],
//             attributes: ['consent_id', 'opt_type', 'consent_confirmed', 'updated_at'],
//             offset,
//             limit,
//             order: order,
//             subQuery: false
//         });

//         hcp_consents.forEach(hcp_consent => {
//             hcp_consent.dataValues.consent_id = hcp_consent.consent_id;
//             hcp_consent.dataValues.consent_confirmed = hcp_consent.consent_confirmed;
//             hcp_consent.dataValues.legal_basis = hcp_consent.consent.legal_basis;
//             hcp_consent.dataValues.given_date = hcp_consent.updated_at;
//             hcp_consent.dataValues.preference = hcp_consent.consent.preference;
//             hcp_consent.dataValues.category = hcp_consent.consent.consent_category.title;
//             hcp_consent.dataValues.type = hcp_consent.consent.consent_category.slug;

//             delete hcp_consent.dataValues['consent'];
//         });

//         const total_consents = await HcpConsents.count({
//             where: consent_filter,
//             include: [
//                 {
//                     model: HCPS,
//                 },
//                 {
//                     model: Consent,
//                     include: [
//                         {
//                             model: ConsentCategory
//                         }
//                     ]
//                 }
//             ]
//         });

//         const data = {
//             hcp_consents: hcp_consents,
//             page: page + 1,
//             limit,
//             total: total_consents,
//             start: limit * page + 1,
//             end: offset + limit > total_consents ? total_consents : offset + limit,
//             codbase: codbase ? codbase : '',
//             opt_type: opt_type ? opt_type : '',
//             countries: userCountriesApplication[1],
//             orderBy: orderBy,
//             orderType: orderType
//         };

//         response.data = data;
//         res.json(response);
//     } catch (err) {
//         console.error(err);
//         response.errors.push(new CustomError('Internal server error', 500));
//         res.status(500).send(response);
//     }
// }

// async function getVeevaConsentsReport(req, res) {
//     const response = new Response({}, []);

//     try {
//         const page = req.query.page ? req.query.page - 1 : 0;
//         const limit = 30;
//         const codbase = req.query.codbase === undefined ? '' : req.query.codbase;
//         const opt_type = req.query.opt_type === undefined ? '' : req.query.opt_type;
//         const offset = page * limit;

//         const [, userPermittedCountries] = await getUserPermissions(req.user.id);
//         const countries = await sequelize.datasyncConnector.query("SELECT * FROM ciam.vwcountry;", { type: QueryTypes.SELECT });

//         async function getCountryIso2() {
//             const user_codbase_list_for_iso2 = countries.filter(i => userPermittedCountries.includes(i.country_iso2)).map(i => i.codbase);
//             const user_country_iso2_list = countries.filter(i => user_codbase_list_for_iso2.includes(i.codbase)).map(i => i.country_iso2);
//             return user_country_iso2_list;
//         }

//         const country_iso2_list_for_codbase = countries.filter(i => i.codbase === codbase).map(i => i.country_iso2);
//         const country_iso2_list = await getCountryIso2();

//         const orderBy = req.query.orderBy ? req.query.orderBy : '';
//         const orderType = req.query.orderType && req.query.orderType.toLowerCase() === "desc" ? "DESC" : "ASC";
//         let sortBy = 'content_type';

//         if (orderBy && orderType) {
//             if (orderBy === 'name') sortBy = 'ciam.vw_veeva_consent_master.account_name';
//             if (orderBy === 'email') sortBy = 'ciam.vw_veeva_consent_master.channel_value';
//             // if(orderBy === 'consent_type') order.push([Consent, ConsentCategory, 'title', orderType]);

//             if (orderBy === 'opt_type') sortBy = 'ciam.vw_veeva_consent_master.opt_type';

//             // if(orderBy === 'legal_basis') order.push([Consent, 'legal_basis', orderType]);
//             if (orderBy === 'preferences') sortBy = 'ciam.vw_veeva_consent_master.content_type';
//             if (orderBy === 'date') sortBy = 'ciam.vw_veeva_consent_master.capture_datetime';
//         }

//         const getConsentFilter = () => {
//             if(opt_type === 'single-opt-in') return `ciam.vw_veeva_consent_master.country_code = ANY($countries) and
//                 ciam.vw_veeva_consent_master.opt_type = 'Opt_In_vod' and
//                 (ciam.vw_veeva_consent_master.double_opt_in = false or ciam.vw_veeva_consent_master.double_opt_in IS NULL)`;
//             if(opt_type === 'double-opt-in') return `ciam.vw_veeva_consent_master.country_code = ANY($countries) and
//                 ciam.vw_veeva_consent_master.opt_type = 'Opt_In_vod' and
//                 ciam.vw_veeva_consent_master.double_opt_in = true`;
//             if(opt_type === 'opt-out') return `ciam.vw_veeva_consent_master.country_code = ANY($countries) and
//                 ciam.vw_veeva_consent_master.opt_type = 'Opt_Out_vod'`
//             return `ciam.vw_veeva_consent_master.country_code = ANY($countries)`;
//         }
//         const consent_filter = getConsentFilter();

//         const hcp_consents = await sequelize.datasyncConnector.query(
//             `SELECT
//                 account_name,
//                 content_type,
//                 opt_type,
//                 capture_datetime,
//                 onekeyid,
//                 uuid_mixed,
//                 country_code,
//                 double_opt_in,
//                 uuid_mixed,
//                 channel_value
//             FROM
//                 ciam.vw_veeva_consent_master
//             WHERE ${consent_filter}
//             ORDER BY
//                 ${sortBy} ${orderType}
//             offset $offset
//             limit $limit;`
//             , {
//                 bind: {
//                     countries: codbase ? country_iso2_list_for_codbase : country_iso2_list,
//                     offset: offset,
//                     limit: limit,
//                 },
//                 type: QueryTypes.SELECT
//             });

//         const total_consents = (await sequelize.datasyncConnector.query(
//             `SELECT
//                 COUNT(*)
//             FROM
//                 ciam.vw_veeva_consent_master
//             WHERE ${consent_filter}`
//             , {
//                 bind: {
//                     countries: codbase ? country_iso2_list_for_codbase : country_iso2_list
//                 },
//                 type: QueryTypes.SELECT
//             }))[0];


//         hcp_consents.forEach(hcp_consent => {
//             hcp_consent.name = hcp_consent.account_name;
//             hcp_consent.first_name = hcp_consent.firstname;
//             hcp_consent.last_name = hcp_consent.lastname;
//             hcp_consent.email = hcp_consent.channel_value;
//             hcp_consent.opt_type = hcp_consent.opt_type === 'Opt_In_vod' ? hcp_consent.double_opt_in ? 'double-opt-in' : 'single-opt-in' : 'opt-out';
//             hcp_consent.legal_basis = 'consent';
//             hcp_consent.preference = hcp_consent.content_type;
//             hcp_consent.given_date = hcp_consent.capture_datetime;

//             delete hcp_consent['account_name'];
//             delete hcp_consent['firstname'];
//             delete hcp_consent['lastname'];
//             delete hcp_consent['channel_value'];
//             delete hcp_consent['content_type'];
//             delete hcp_consent['capture_datetime'];
//             delete hcp_consent['double_opt_in'];
//         });

//         const data = {
//             hcp_consents: hcp_consents,
//             page: page + 1,
//             limit,
//             total: total_consents.count,
//             start: limit * page + 1,
//             end: offset + limit > total_consents.count ? total_consents.count : offset + limit,
//             codbase: codbase ? codbase : '',
//             opt_type: opt_type ? opt_type : '',
//             countries: userPermittedCountries,
//             orderBy: orderBy,
//             orderType: orderType,
//         };


//         response.data = data;
//         res.json(response);
//     }
//     catch (err) {
//         console.error(err);
//         response.errors.push(new CustomError('Internal server error', 500));
//         res.status(500).send(response);
//     }
// }

// async function getUserConsents(req, res) {
//     const response = new Response({}, []);
//     const userOneKeyID = req.params.id;

//     try {
//         const userConsents = await sequelize.datasyncConnector.query(`
//             SELECT *
//             FROM ciam.vw_veeva_consent_master
//             where ciam.vw_veeva_consent_master.onekeyid = $userOneKeyID;`,
//             {
//                 bind: { userOneKeyID: userOneKeyID },
//                 type: QueryTypes.SELECT
//             }
//         );

//         if (!userConsents) return res.json([]);

//         let id = 0;

//         userConsents.forEach(consent => {
//             consent.id = ++id;
//             consent.title = consent.default_consent_text_vod ? consent.default_consent_text_vod : '';
//             consent.rich_text = consent.disclaimer_text_vod ? consent.disclaimer_text_vod : '';
//             consent.given_time = consent.capture_datetime;
//             consent.opt_type = consent.opt_type === 'Opt_In_vod' ? consent.double_opt_in ? 'double-opt-in' : 'single-opt-in' : 'opt-out';
//         });

//         response.data = userConsents;

//         res.json(response);
//     } catch (err) {
//         console.error(err);
//         response.errors.push(new CustomError('Internal server error', 500));
//         res.status(500).send(response);
//     }
// }

// async function getCdpConsents(req, res) {
//     try {
//         let { translations, category } = req.query;

//         const inclusions = [
//             {
//                 model: User,
//                 as: 'createdByUser',
//                 attributes: ['first_name', 'last_name']
//             },
//             {
//                 model: User,
//                 as: 'updatedByUser',
//                 attributes: ['first_name', 'last_name']
//             }
//         ];

//         if (category === 'true') {
//             inclusions.push({
//                 model: ConsentCategory,
//                 as: 'consent_category',
//                 attributes: ['id', 'title', 'slug']
//             });
//         }

//         const consents = await Consent.findAll({
//             include: inclusions,
//             attributes: {
//                 exclude: ['value']
//             }
//         });

//         const data = consents.map(c => {
//             const createdBy = `${c.createdByUser ? c.createdByUser.first_name : ''} ${c.createdByUser ? c.createdByUser.last_name : ''}`;
//             const updatedBy = `${c.createdByUser ? c.updatedByUser.first_name : ''} ${c.createdByUser ? c.updatedByUser.last_name : ''}`;
//             delete c.dataValues.createdByUser;
//             delete c.dataValues.updatedByUser;
//             return {
//                 ...c.dataValues,
//                 createdBy,
//                 updatedBy
//             }
//         });

//         translations === 'true' && await Promise.all(data.map(async consent => {
//             const consentTranslations = await ConsentLanguage.findAll({
//                 where: {
//                     consent_id: consent.id
//                 }
//             });
//             consent.translations = getTranslationViewmodels(consentTranslations);
//         }));

//         res.json(data);
//     } catch (err) {
//         console.error(err);

//         res.status(500).send('Internal server error');
//     }
// }

// async function getCdpConsent(req, res) {
//     try {
//         if (!req.params.id) {
//             return res.status(400).send('Invalid request.');
//         }

//         const consent = await Consent.findOne({
//             where: {
//                 id: req.params.id
//             },
//             include: [
//                 {
//                     model: User,
//                     as: 'createdByUser',
//                     attributes: ['id', 'first_name', 'last_name']
//                 },
//                 {
//                     model: User,
//                     as: 'updatedByUser',
//                     attributes: ['id', 'first_name', 'last_name']
//                 },
//                 {
//                     model: ConsentCategory,
//                     as: 'consent_category',
//                     attributes: ['id', 'title', 'slug']
//                 },
//                 {
//                     model: ConsentCountry,
//                     as: 'consent_country'
//                 }
//             ],
//             attributes: { exclude: ['category_id', 'created_by', 'updated_by'] }
//         });

//         if (!consent) return res.status(404).send('Consent not found');

//         const createdBy = `${consent.createdByUser.first_name} ${consent.createdByUser.last_name}`;
//         const updatedBy = `${consent.updatedByUser.first_name} ${consent.updatedByUser.last_name}`;
//         delete consent.dataValues.createdByUser;
//         delete consent.dataValues.updatedByUser;

//         const { consent_country, ...otherProps } = consent.dataValues;
//         const data = { ...otherProps, countries: consent_country, createdBy, updatedBy };

//         const translations = await ConsentLanguage.findAll({
//             where: { consent_id: consent.id }
//         });

//         data.translations = getTranslationViewmodels(translations);

//         res.json(data);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal server error');
//     }
// }

// async function createConsent(req, res) {
//     try {
//         let { preference, category_id, legal_basis, is_active, translations } = req.body;

//         if (!preference.trim() || !category_id || !legal_basis) {
//             return res.status(400).send('Invalid request.');
//         }

//         if (!translations || !translations.length) {
//             return res.status(400).send('Please provide at least one translation.');
//         }

//         const invalidTranslations = translations.filter(t => !t.country_iso2 || !t.lang_code || !t.rich_text);
//         if (invalidTranslations && invalidTranslations.length) {
//             return res.status(400).send('Translations not valid.');
//         }

//         const uniqueTranslations = new Set(translations.map(t => t.country_iso2.toLowerCase() + t.lang_code.toLowerCase()));
//         if (uniqueTranslations.size < translations.length) {
//             return res.status(400).send('Please remove duplicate translations.');
//         }

//         is_active = !!is_active;

//         const consentCategory = await ConsentCategory.findOne({ where: { id: category_id } });
//         if (!consentCategory) return res.status(400).send('Invalid Consent Category');

//         const [consent, created] = await Consent.findOrCreate({
//             where: {
//                 preference: { [Op.iLike]: preference.trim() }
//             },
//             defaults: {
//                 preference: preference.trim(),
//                 slug: makeCustomSlug(preference.trim()),
//                 category_id,
//                 legal_basis,
//                 is_active,
//                 created_by: req.user.id,
//                 updated_by: req.user.id
//             },
//             attributes: { exclude: ['created_at', 'updated_at'] }
//         });

//         if (!created && consent) {
//             return res.status(400).send('Consent with same Preference already exists.');
//         }

//         const data = { ...consent.dataValues };

//         if (created) {
//             data.translations = [];
//             await Promise.all(translations
//                 .filter(translation => translation.country_iso2 && translation.lang_code && translation.rich_text)
//                 .map(async (translation) => {
//                     const locale = `${translation.lang_code.toLowerCase()}_${translation.country_iso2.toUpperCase()}`;
//                     const [consentTransation, translationCreated] = await ConsentLanguage.findOrCreate({
//                         where: {
//                             consent_id: consent.id,
//                             locale: {
//                                 [Op.iLike]: locale
//                             }
//                         },
//                         defaults: {
//                             locale: locale,
//                             rich_text: translation.rich_text,
//                             consent_id: consent.id
//                         }
//                     });

//                     if (translationCreated) {
//                         await logService.log({
//                             event_type: 'CREATE',
//                             object_id: consentTransation.id,
//                             table_name: 'consent_locales',
//                             actor: req.user.id,
//                             changes: JSON.stringify(consentTransation.dataValues)
//                         });

//                         data.translations.push(consentTransation);
//                     } else {
//                         console.error('Create Translation failed: ', translation);
//                     }
//                 })
//             );
//         }

//         await logService.log({
//             event_type: 'CREATE',
//             object_id: data.id,
//             table_name: 'consents',
//             actor: req.user.id,
//             changes: JSON.stringify(consent.dataValues)
//         });

//         res.json(data);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal server error');
//     }
// }

// async function updateCdpConsent(req, res) {
//     try {
//         const { preference, category_id, legal_basis, is_active, translations } = req.body;

//         const id = req.params.id;
//         if (!id || !preference || !category_id || !legal_basis) {
//             return res.status(400).send('Invalid request.');
//         }

//         if (!translations || !translations.length) {
//             return res.status(400).send('Please provide at least one translation.');
//         } else {
//             const uniqueTranslations = new Set(translations.map(t => t.country_iso2.toLowerCase() + t.lang_code.toLowerCase()));
//             if (uniqueTranslations.size < translations.length) return res.status(400).send('Please remove duplicate translations.');
//         }

//         const consentCategory = await ConsentCategory.findOne({ where: { id: category_id } });
//         if (!consentCategory) return res.status(400).send('Invalid Consent Category');

//         const consentWithSamePreference = await Consent.findOne({
//             where: {
//                 preference: { [Op.iLike]: preference.trim() },
//                 id: { [Op.ne]: id }
//             }
//         });
//         if (consentWithSamePreference) return res.status(400).send('Another Consent with same Preference exists.');

//         const consent = await Consent.findOne({ where: { id: id } });
//         if (!consent) return res.status(404).send('Consent not found.');

//         const consentBeforeUpdate = { ...consent.dataValues };

//         await consent.update({
//             preference: preference.trim(),
//             category_id,
//             legal_basis,
//             is_active,
//             updated_by: req.user.id
//         });

//         const allTranslationsForConsent = await ConsentLanguage.findAll({ where: { consent_id: consent.id } });

//         const deletedTranslations = allTranslationsForConsent
//             .filter(t1 => !translations.some(t2 => t1.id === t2.id));

//         await ConsentLanguage.destroy({ where: { consent_id: consent.id } });

//         if (translations) {
//             await Promise.all(translations
//                 .filter(translation => translation.country_iso2 && translation.lang_code && translation.rich_text)
//                 .map(async (translation,idx) => {
//                     const locale = `${translation.lang_code.toLowerCase()}_${translation.country_iso2.toUpperCase()}`;
//                     const [updatedTranslation, translationCreated] = await ConsentLanguage.findOrCreate({
//                         where: {
//                             consent_id: consent.id,
//                             locale: {
//                                 [Op.iLike]: locale
//                             }
//                         },
//                         defaults: {
//                             locale: locale,
//                             rich_text: translation.rich_text,
//                             consent_id: consent.id
//                         }
//                     });

//                     const isUpdated = allTranslationsForConsent.find(({ id }) => id === translation.id);

//                     if (!translationCreated) {
//                         console.error('Create Translation failed: ', translation);
//                     }else if (isUpdated) {
//                         await logService.log({
//                             event_type: 'UPDATE',
//                             object_id: translation.id,
//                             table_name: 'consent_locales',
//                             actor: req.user.id,
//                             changes: JSON.stringify({
//                                 old_value: isUpdated.dataValues,
//                                 new_value: updatedTranslation.dataValues
//                             })
//                         });
//                     }else {
//                         await logService.log({
//                             event_type: 'CREATE',
//                             object_id: translation.id,
//                             table_name: 'consent_locales',
//                             actor: req.user.id,
//                             changes: JSON.stringify(updatedTranslation.dataValues)
//                         });
//                     }
//                 })
//             );
//         }

//         await logService.log({
//             event_type: 'UPDATE',
//             object_id: consent.id,
//             table_name: 'consents',
//             actor: req.user.id,
//             changes: JSON.stringify({
//                 old_value: consentBeforeUpdate,
//                 new_value: consent.dataValues
//             })
//         });

//         await Promise.all(deletedTranslations.map(async dt => {
//             return await logService.log({
//                 event_type: 'DELETE',
//                 object_id: dt.id,
//                 table_name: 'consent_locales',
//                 actor: req.user.id,
//                 changes: JSON.stringify(dt.dataValues)
//             });
//         }))

//         res.sendStatus(200);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal server error');
//     }
// }

// async function getCountryConsents(req, res) {
//     try {
//         const countryConsents = await ConsentCountry.findAll({
//             include: [{
//                 model: Consent,
//                 as: 'consent',
//                 attributes: { exclude: ['created_at', 'updated_at'] }
//             }]
//         });

//         if (!countryConsents || countryConsents.length < 1) {
//             return res.status(400).send('Country Consents not found.');
//         }

//         await Promise.all(countryConsents.map(async (countryConsent) => {
//             const consentTranslations = await ConsentLanguage.findAll({
//                 where: { consent_id: countryConsent.consent_id },
//                 attributes: { exclude: ['consent_id', 'created_at', 'updated_at'] }
//             });
//             countryConsent.dataValues.consent.dataValues.translations = getTranslationViewmodels(consentTranslations);
//         }));

//         res.json(countryConsents);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal server error');
//     }
// }

// async function assignConsentToCountry(req, res) {
//     try {
//         const { consent_id, country_iso2, opt_type } = req.body;

//         if (!consent_id || !country_iso2 || !opt_type) {
//             return res.status(400).send('Invalid request.');
//         }

//         const availableOptTypes = ConsentCountry.rawAttributes.opt_type.values;
//         if (!availableOptTypes.includes(opt_type)) return res.status(400).send('Invalid Opt Type');

//         const existingCountryConsent = await ConsentCountry.findOne({
//             where: {
//                 consent_id: consent_id,
//                 country_iso2: {
//                     [Op.iLike]: country_iso2
//                 }
//             }
//         });

//         if (existingCountryConsent) return res.status(400).send('This Consent is already added for the selected Country');

//         const consent = await Consent.findOne({ where: { id: consent_id } });
//         if (!consent) return res.status(400).send('Consent not found.');

//         const translations = await ConsentLanguage.findAll({
//             where: { consent_id: consent.id }
//         });

//         consent.dataValues.translations = getTranslationViewmodels(translations);

//         const createdCountryConsent = await ConsentCountry.create({
//             consent_id,
//             country_iso2: country_iso2.toUpperCase(),
//             opt_type
//         });

//         createdCountryConsent.dataValues.consent = consent;

//         await logService.log({
//             event_type: 'CREATE',
//             object_id: createdCountryConsent.id,
//             table_name: 'consent_countries',
//             actor: req.user.id,
//             changes: JSON.stringify(createdCountryConsent.dataValues)
//         });

//         res.json(createdCountryConsent);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal server error');
//     }
// }

// async function updateCountryConsent(req, res) {
//     try {
//         const id = req.params.id;
//         const optType = req.body.opt_type;

//         if (!id || !optType) return res.status(400).send('Invalid request.');

//         const consentCountry = await ConsentCountry.findOne({ where: { id } });

//         if (!consentCountry) return res.status(404).send('Country-Consent association does not exist.');

//         const consentCountryBeforeUpdate = {...consentCountry.dataValues};

//         await consentCountry.update({
//             opt_type: optType
//         });

//         await logService.log({
//             event_type: 'UPDATE',
//             object_id: consentCountry.id,
//             table_name: 'consent_countries',
//             actor: req.user.id,
//             changes: JSON.stringify({
//                 old_value: consentCountryBeforeUpdate,
//                 new_value: consentCountry.dataValues
//             })
//         });

//         res.json(consentCountry);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal server error');
//     }
// }

// async function deleteCountryConsent(req, res) {
//     try {
//         const id = req.params.id;

//         if (!id) return res.status(400).send('Invalid request.');

//         const consentCountry = await ConsentCountry.findOne({ where: { id } });
//         if (!consentCountry) return res.status(404).send('Country-Consent association does not exist.');

//         const deleted = await ConsentCountry.destroy({ where: { id } });

//         if (!deleted) return res.status(400).send('Delete failed.');

//         await logService.log({
//             event_type: 'DELETE',
//             object_id: id,
//             table_name: 'consent_countries',
//             actor: req.user.id,
//             changes: JSON.stringify(consentCountry.dataValues)
//         });

//         res.sendStatus(200);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal server error');
//     }
// }

// async function getConsentCategory(req, res) {
//     try {
//         const data = await ConsentCategory.findOne({ where: { id: req.params.id } });
//         res.json(data);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal server error');
//     }
// }

// async function getConsentCategories(req, res) {
//     try {
//         const categories = await ConsentCategory.findAll({
//             include: [{
//                 model: User,
//                 as: 'createdByUser',
//                 attributes: ['first_name', 'last_name'],
//             }],
//             order: [['title', 'ASC']]
//         });

//         const data = categories.map(c => {
//             const createdBy = `${c.createdByUser ? c.createdByUser.first_name : ''} ${c.createdByUser ? c.createdByUser.last_name : ''}`
//             delete c.dataValues.createdByUser;
//             delete c.dataValues.created_by;
//             delete c.dataValues.updated_by;
//             return {
//                 ...c.dataValues,
//                 createdBy
//             };
//         });

//         res.json(data);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal server error');
//     }
// }

// async function createConsentCategory(req, res) {
//     try {
//         const [data, created] = await ConsentCategory.findOrCreate({
//             where: {
//                 title: {
//                     [Op.iLike]: req.body.title.trim()
//                 }
//             },
//             defaults: {
//                 title: req.body.title.trim(),
//                 slug: req.body.title.trim(),
//                 created_by: req.user.id,
//                 updated_by: req.user.id
//             }
//         });

//         if (!created && data) return res.status(400).send('The consent category already exists.');

//         data.dataValues.createdBy = `${req.user.first_name} ${req.user.last_name}`;

//         await logService.log({
//             event_type: 'CREATE',
//             object_id: data.id,
//             table_name: 'consent_categories',
//             actor: req.user.id,
//             changes: JSON.stringify(data.dataValues)
//         });

//         res.json(data);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal server error');
//     }
// }

// async function updateConsentCategory(req, res) {
//     try {
//         const { title } = req.body;

//         const consentCategory = await ConsentCategory.findOne({ where: { id: req.params.id } });
//         if (!consentCategory) return res.status(404).send('The consent category does not exist');

//         const isTitleExists = await ConsentCategory.findOne({
//             where: {
//                 id: { [Op.not]: req.params.id },
//                 title: {
//                     [Op.iLike]: title.trim()
//                 }
//             }
//         });

//         if (isTitleExists) return res.status(400).send('The consent category already exists.');

//         const consentCategoryBeforeUpdate = {...consentCategory.dataValues};

//         const data = await consentCategory.update({ title: title.trim(), slug: title.trim(), updated_by: req.user.id });

//         await logService.log({
//             event_type: 'UPDATE',
//             object_id: consentCategory.id,
//             table_name: 'consent_categories',
//             actor: req.user.id,
//             changes: JSON.stringify({
//                 old_value: consentCategoryBeforeUpdate,
//                 new_value: data.dataValues
//             })
//         });

//         res.json(data);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal server error');
//     }
// }

// exports.getConsents = getConsents;
// exports.getCdpConsentsReport = getCdpConsentsReport;
// exports.getVeevaConsentsReport = getVeevaConsentsReport;
// exports.getUserConsents = getUserConsents;
// exports.getCdpConsents = getCdpConsents;
// exports.getCdpConsent = getCdpConsent;
// exports.createConsent = createConsent;
// exports.updateCdpConsent = updateCdpConsent;
// exports.getCountryConsents = getCountryConsents;
// exports.assignConsentToCountry = assignConsentToCountry;
// exports.updateCountryConsent = updateCountryConsent;
// exports.deleteCountryConsent = deleteCountryConsent;
// exports.getConsentCategory = getConsentCategory;
// exports.getConsentCategories = getConsentCategories;
// exports.createConsentCategory = createConsentCategory;
// exports.updateConsentCategory = updateConsentCategory;
