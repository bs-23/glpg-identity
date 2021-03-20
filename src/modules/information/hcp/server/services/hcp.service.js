const path = require('path');
const { Op } = require('sequelize');
const validator = require('validator');
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));
const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model'));
const ConsentLocale = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent-locale.model'));
const ConsentCountry = require(path.join(process.cwd(), 'src/modules/privacy/consent-country/server/consent-country.model'));

async function updateConsents(hcp, consent_response, actor) {
    try {
        if (consent_response && consent_response.length) {
            const consents = [];

            await Promise.all(consent_response.map(async x => {
                const consentId = Object.keys(x)[0];
                const consentResponse = Object.values(x)[0];

                const consent = await Consent.findOne({
                    attributes: ['id'],
                    where: { id: consentId },
                    include: [
                        {
                            model: ConsentLocale,
                            attributes: ['locale', 'rich_text'],
                            where: {
                                locale: {
                                    [Op.iLike]: hcp.locale
                                },
                                consent_id: consentId
                            }
                        },
                        {
                            model: ConsentCountry,
                            attributes: ['opt-type'],
                            where: {
                                country_iso2: {
                                    [Op.iLike]: hcp.country_iso2
                                },
                                consent_id: consentId
                            }
                        }
                    ]
                });

                const consentOptType = consentResponse ? consent.consent_country.dataValues.opt_type : 'opt-out';

                if(!consent) return;

                const hcpConsent = await HcpConsent.findOne({
                    where: { user_id: hcp.id, consent_id: consentId },
                    order: [ [ 'created_at', 'DESC' ]]
                });

                if(hcpConsent && hcpConsent.opt_type === consentOptType) return;

                consents.push({
                    user_id: hcp.id,
                    consent_id: consentId,
                    consent_confirmed: consent.consent_country.dataValues.opt_type === 'double-opt-in' ? false : true,
                    opt_type: consentOptType,
                    rich_text: validator.unescape(consent.consent_locale.dataValues.rich_text),
                    consent_locale: consent.consent_locale.dataValues.locale,
                    created_by: actor.id,
                    updated_by: actor.id
                });

                await hcpConsent.update({ expired_at: new Date() });
            }));

            if(consents.length) {
                await HcpConsent.bulkCreate(consents, {
                    returning: true,
                    ignoreDuplicates: false
                });
            }
        }
    } catch(err) {
        logger.error(err);
    }
}

exports.updateConsents = updateConsents;
