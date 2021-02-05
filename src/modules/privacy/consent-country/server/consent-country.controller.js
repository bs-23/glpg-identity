const path = require('path');
const _ = require('lodash');
const { Op } = require('sequelize');
const validator = require('validator');

const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model.js'));
const ConsentCountry = require(path.join(process.cwd(), 'src/modules/privacy/consent-country/server/consent-country.model.js'));
const ConsentLanguage = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent-locale.model.js'));
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));
const { clearApplicationCache } = require(path.join(process.cwd(), 'src/modules/platform/application/server/application.controller'));

function getTranslationViewmodels(translations) {
    return translations.map(t => ({
        id: t.id,
        locale: t.locale,
        rich_text: validator.unescape(t.rich_text)
    }));
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
        if (!availableOptTypes.includes(opt_type)) return res.status(400).send('Invalid Opt Type');

        const existingCountryConsent = await ConsentCountry.findOne({
            where: {
                consent_id: consent_id,
                country_iso2: {
                    [Op.iLike]: country_iso2
                }
            }
        });

        if (existingCountryConsent) return res.status(400).send('This Consent is already added for the selected Country');

        const consent = await Consent.findOne({ where: { id: consent_id } });
        if (!consent) return res.status(400).send('Consent not found.');

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

        await logService.log({
            event_type: 'CREATE',
            object_id: createdCountryConsent.id,
            table_name: 'consent_countries',
            actor: req.user.id,
            changes: createdCountryConsent.dataValues
        });

        // clearApplicationCache();

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

        if (!consentCountry) return res.status(404).send('Country-Consent association does not exist.');

        const consentCountryBeforeUpdate = {...consentCountry.dataValues};

        await consentCountry.update({
            opt_type: optType
        });

        const updatesInConsentCountry = logService.difference(consentCountry.dataValues, consentCountryBeforeUpdate);

        if (updatesInConsentCountry) {
            await logService.log({
                event_type: 'UPDATE',
                object_id: consentCountry.id,
                table_name: 'consent_countries',
                actor: req.user.id,
                changes: updatesInConsentCountry
            });
        }

        // clearApplicationCache();

        res.json(consentCountry);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function deleteCountryConsent(req, res) {
    try {
        const id = req.params.id;

        if (!id) return res.status(400).send('Invalid request.');

        const consentCountry = await ConsentCountry.findOne({ where: { id } });
        if (!consentCountry) return res.status(404).send('Country-Consent association does not exist.');

        const deleted = await ConsentCountry.destroy({ where: { id } });

        if (!deleted) return res.status(400).send('Delete failed.');

        await logService.log({
            event_type: 'DELETE',
            object_id: id,
            table_name: 'consent_countries',
            actor: req.user.id,
            changes: consentCountry.dataValues
        });

        // clearApplicationCache();

        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getCountryConsents = getCountryConsents;
exports.assignConsentToCountry = assignConsentToCountry;
exports.updateCountryConsent = updateCountryConsent;
exports.deleteCountryConsent = deleteCountryConsent;
