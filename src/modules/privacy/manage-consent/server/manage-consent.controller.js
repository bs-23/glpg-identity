const path = require('path');
const _ = require('lodash');
const { Op } = require('sequelize');
const validator = require('validator');
const uniqueSlug = require('unique-slug');

const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model'));
const ConsentLocale = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent-locale.model'));
const ConsentCountry = require(path.join(process.cwd(), 'src/modules/privacy/consent-country/server/consent-country.model'));
const ConsentCategory = require(path.join(process.cwd(), 'src/modules/privacy/consent-category/server/consent-category.model'));
const ConsentLanguage = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent-locale.model'));
const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model.js'));
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));
const { clearApplicationCache } = require(path.join(process.cwd(), 'src/modules/platform/application/server/application.controller'));
const archiveService = require(path.join(process.cwd(), 'src/modules/core/server/archive/archive.service'));
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));

const convertToSlug = string => string.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

const makeCustomSlug = (title) => {
    const code = uniqueSlug(`${title}`);
    if (title.length > 50) return convertToSlug(`${title.substring(0, 50)} ${code}`);
    return convertToSlug(`${title} ${code}`);
};

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
        let { country_iso2, locale, category } = req.query;

        if (!country_iso2) {
            response.errors.push(new CustomError('Invalid query parameters'));
            return res.status(400).send(response);
        }

        locale = locale || 'en';

        const conditions = {
            country_iso2: {
                [Op.iLike]: country_iso2
            },
            '$consent.is_active$': true
        };

        if (category) {
            conditions['$consent.consent_category.slug$'] = category;
        }

        const consentCountries = await ConsentCountry.findAll({
            where: conditions,
            include: [{
                model: Consent,
                as: 'consent',
                include: [{
                    model: ConsentCategory,
                    as: 'consent_category'
                }]
            }]
        });

        if (!consentCountries || !consentCountries.length) {
            response.errors.push(new CustomError(`No consent of this category found for ${country_iso2}`, 404));
            return res.status(404).send(response);
        }

        const consentLocales = await Promise.all(consentCountries.map(async consentCountry => {
            return await ConsentLocale.findAll({
                where: {
                    consent_id: consentCountry.consent_id,
                    locale: {
                        [Op.iLike]: `%${locale}`
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
                        [Op.iLike]: country_iso2
                    },
                    consent_id: consentLang.consent_id
                }
            });

            return {
                id: consentLang.consent.id,
                preference: consentLang.consent.preference,
                slug: consentLang.consent.slug,
                legal_basis: consentLang.consent.legal_basis,
                rich_text: validator.unescape(consentLang.rich_text),
                category_title: consentLang.consent.consent_category.title,
                category_slug: consentLang.consent.consent_category.slug,
                country_iso2: country_iso2,
                locale: consentLang.locale,
                locale_id: consentLang.id,
                opt_type: consentCountry.opt_type
            }
        }));

        if (!result || !result.length) {
            response.data = [];
            return res.status(204).send(response);
        }

        response.data = result;

        res.json(response);
    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getCdpConsents(req, res) {
    try {
        let { translations, category } = req.query;

        const inclusions = [
            {
                model: User,
                as: 'createdByUser',
                attributes: ['first_name', 'last_name']
            },
            {
                model: User,
                as: 'updatedByUser',
                attributes: ['first_name', 'last_name']
            }
        ];

        if (category === 'true') {
            inclusions.push({
                model: ConsentCategory,
                as: 'consent_category',
                attributes: ['id', 'title', 'slug']
            });
        }

        const consents = await Consent.findAll({
            include: inclusions,
            attributes: {
                exclude: ['value']
            }
        });

        const data = consents.map(c => {
            const createdBy = `${c.createdByUser ? c.createdByUser.first_name : ''} ${c.createdByUser ? c.createdByUser.last_name : ''}`;
            const updatedBy = `${c.createdByUser ? c.updatedByUser.first_name : ''} ${c.createdByUser ? c.updatedByUser.last_name : ''}`;
            delete c.dataValues.createdByUser;
            delete c.dataValues.updatedByUser;
            return {
                ...c.dataValues,
                createdBy,
                updatedBy
            }
        });

        translations === 'true' && await Promise.all(data.map(async consent => {
            const consentTranslations = await ConsentLanguage.findAll({
                where: {
                    consent_id: consent.id
                }
            });
            consent.translations = getTranslationViewmodels(consentTranslations);
        }));

        res.json(data);
    } catch (err) {
        logger.error(err);

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
                    attributes: ['id', 'first_name', 'last_name']
                },
                {
                    model: User,
                    as: 'updatedByUser',
                    attributes: ['id', 'first_name', 'last_name']
                },
                {
                    model: ConsentCategory,
                    as: 'consent_category',
                    attributes: ['id', 'title', 'slug']
                },
                {
                    model: ConsentCountry,
                    as: 'consent_country'
                }
            ],
            attributes: { exclude: ['category_id', 'created_by', 'updated_by'] }
        });

        if (!consent) return res.status(404).send('Consent not found');

        const createdBy = `${consent.createdByUser.first_name} ${consent.createdByUser.last_name}`;
        const updatedBy = `${consent.updatedByUser.first_name} ${consent.updatedByUser.last_name}`;
        delete consent.dataValues.createdByUser;
        delete consent.dataValues.updatedByUser;

        const { consent_country, ...otherProps } = consent.dataValues;
        const data = { ...otherProps, countries: consent_country, createdBy, updatedBy };

        const translations = await ConsentLanguage.findAll({
            where: { consent_id: consent.id }
        });

        data.translations = getTranslationViewmodels(translations);

        res.json(data);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function createConsent(req, res) {
    try {
        let { preference, category_id, legal_basis, is_active, translations } = req.body;

        if (!preference.trim() || !category_id || !legal_basis) {
            return res.status(400).send('Invalid request.');
        }

        if (!translations || !translations.length) {
            return res.status(400).send('Please provide at least one translation.');
        }

        const invalidTranslations = translations.filter(t => !t.locale || !t.rich_text);
        if (invalidTranslations && invalidTranslations.length) {
            return res.status(400).send('Translations not valid.');
        }

        const uniqueTranslations = new Set(translations.map(t => t.locale.toLowerCase()));
        if (uniqueTranslations.size < translations.length) {
            return res.status(400).send('Please remove duplicate translations.');
        }

        is_active = !!is_active;

        const consentCategory = await ConsentCategory.findOne({ where: { id: category_id } });
        if (!consentCategory) return res.status(400).send('Invalid Consent Category');

        const [consent, created] = await Consent.findOrCreate({
            where: {
                preference: { [Op.iLike]: preference.trim() }
            },
            defaults: {
                preference: preference.trim(),
                slug: makeCustomSlug(preference.trim()),
                category_id,
                legal_basis,
                is_active,
                created_by: req.user.id,
                updated_by: req.user.id
            },
            attributes: { exclude: ['created_at', 'updated_at'] }
        });

        if (!created && consent) {
            return res.status(400).send('Consent with same Preference already exists.');
        }

        const data = { ...consent.dataValues };

        if (created) {
            data.translations = [];
            await Promise.all(translations
                .filter(translation => translation.locale && translation.rich_text)
                .map(async (translation) => {
                    const [consentTransation, translationCreated] = await ConsentLanguage.findOrCreate({
                        where: {
                            consent_id: consent.id,
                            locale: {
                                [Op.iLike]: translation.locale
                            }
                        },
                        defaults: {
                            locale: translation.locale,
                            rich_text: translation.rich_text,
                            consent_id: consent.id
                        }
                    });

                    if (translationCreated) {
                        await logService.log({
                            event_type: 'CREATE',
                            object_id: consentTransation.id,
                            table_name: 'consent_locales',
                            actor: req.user.id,
                            changes: consentTransation.dataValues
                        });

                        data.translations.push(consentTransation);
                    } else {
                        logger.error('Create Translation failed: ', translation);
                    }
                })
            );
        }

        await logService.log({
            event_type: 'CREATE',
            object_id: data.id,
            table_name: 'consents',
            actor: req.user.id,
            changes: consent.dataValues
        });

        clearApplicationCache();

        res.json(data);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function updateCdpConsent(req, res) {
    try {
        const { preference, category_id, legal_basis, is_active, translations } = req.body;

        const id = req.params.id;
        if (!id || !preference || !category_id || !legal_basis) {
            return res.status(400).send('Invalid request.');
        }

        if (!translations || !translations.length) {
            return res.status(400).send('Please provide at least one translation.');
        } else {
            const uniqueTranslations = new Set(translations.map(t => t.locale.toLowerCase()));
            if (uniqueTranslations.size < translations.length) return res.status(400).send('Please remove duplicate translations.');
        }

        const consentCategory = await ConsentCategory.findOne({ where: { id: category_id } });
        if (!consentCategory) return res.status(400).send('Invalid Consent Category');

        const consentWithSamePreference = await Consent.findOne({
            where: {
                preference: { [Op.iLike]: preference.trim() },
                id: { [Op.ne]: id }
            }
        });
        if (consentWithSamePreference) return res.status(400).send('Another Consent with same Preference exists.');

        const consent = await Consent.findOne({ where: { id: id } });
        if (!consent) return res.status(404).send('Consent not found.');

        const consentBeforeUpdate = { ...consent.dataValues };

        await consent.update({
            preference: preference.trim(),
            category_id,
            legal_basis,
            is_active,
            updated_by: req.user.id
        });

        const response = {
            ...consent.dataValues,
            translations: Array.apply(null, Array(translations.length))
        };

        const allTranslationsForConsent = await ConsentLanguage.findAll({ where: { consent_id: consent.id } });

        const deletedTranslations = allTranslationsForConsent
            .filter(t1 => !translations.some(t2 => t1.id === t2.id));

        await ConsentLanguage.destroy({ where: { id: deletedTranslations.map(dt => dt.id) } });

        if (translations) {
            await Promise.all(translations
                .filter(translation => translation.locale && translation.rich_text)
                .map(async (translation, idx) => {
                    const currentTranslationFromDB = allTranslationsForConsent.find(at => at.id === translation.id);

                    if (currentTranslationFromDB) {
                        try{
                            const previousTranslation = { ...currentTranslationFromDB.dataValues };

                            await currentTranslationFromDB.update({
                                locale: translation.locale,
                                rich_text: translation.rich_text,
                                consent_id: consent.id
                            })

                            const updatesInTranslation = logService.difference(currentTranslationFromDB.dataValues, previousTranslation);

                            if (updatesInTranslation) {
                                await logService.log({
                                    event_type: 'UPDATE',
                                    object_id: currentTranslationFromDB.id,
                                    table_name: 'consent_locales',
                                    actor: req.user.id,
                                    changes: updatesInTranslation
                                });
                            }

                            response.translations[idx] = currentTranslationFromDB.dataValues;
                        } catch(err) {
                            logger.error(err);
                        }
                    } else {
                        try{
                            const createdTranslation = await ConsentLanguage.create({
                                consent_id: consent.id,
                                locale: translation.locale,
                                rich_text: translation.rich_text
                            });

                            await logService.log({
                                event_type: 'CREATE',
                                object_id: createdTranslation.id,
                                table_name: 'consent_locales',
                                actor: req.user.id,
                                changes: createdTranslation.dataValues
                            });

                            response.translations[idx] = createdTranslation;
                        } catch(err) {
                            logger.error(err);
                        }
                    }
                })
            );
        }

        clearApplicationCache();

        const updatesInConsent = logService.difference(consent.dataValues, consentBeforeUpdate);

        if (updatesInConsent) {
            await logService.log({
                event_type: 'UPDATE',
                object_id: consent.id,
                table_name: 'consents',
                actor: req.user.id,
                changes: updatesInConsent
            });
        }

        await Promise.all(deletedTranslations.map(async dt => {
            await logService.log({
                event_type: 'DELETE',
                object_id: dt.id,
                table_name: 'consent_locales',
                actor: req.user.id,
                changes: dt.dataValues
            });

            await archiveService.archiveData({
                object_id: dt.id,
                table_name: 'consent_locales',
                data: dt.dataValues,
                actor: req.user.id
            });
        }));

        res.status(200).json(response);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getConsents = getConsents;
exports.getCdpConsents = getCdpConsents;
exports.getCdpConsent = getCdpConsent;
exports.createConsent = createConsent;
exports.updateCdpConsent = updateCdpConsent;
