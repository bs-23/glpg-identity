const path = require('path');
const { Op } = require('sequelize');
const validator = require('validator');
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));
const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model'));
const HcpConsent = require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-consents.model'));
const ConsentLocale = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent-locale.model'));

async function updateConsents(hcp, consent_response, actor) {
    try {
        if (consent_response && consent_response.length) {
            const newHcpConsents = [];

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
                        }
                    ]
                });

                if(!consent) return;

                const consentOptType = consentResponse ? 'opt-in' : 'opt-out';

                let existingHcpConsent = await HcpConsent.findOne({
                    where: { user_id: hcp.id, consent_id: consentId, expired_at: null },
                    attributes: ['id', 'opt_type']
                });

                if(existingHcpConsent && existingHcpConsent.opt_type === consentOptType) return;

                newHcpConsents.push({
                    user_id: hcp.id,
                    consent_id: consentId,
                    opt_type: consentOptType,
                    rich_text: validator.unescape(consent.consent_locales[0].rich_text),
                    consent_locale: consent.consent_locales[0].locale,
                    created_by: actor.id,
                    updated_by: actor.id
                });

                if(existingHcpConsent) {
                    await existingHcpConsent.update({ expired_at: new Date(Date.now()) });
                }
            }));

            if(newHcpConsents.length) {
                await HcpConsent.bulkCreate(newHcpConsents, {
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
