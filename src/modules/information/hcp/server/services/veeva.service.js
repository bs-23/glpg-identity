const path = require('path');
const axios = require('axios');
const parser = require('html-react-parser');
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const auditService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));
const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model'));
const HcpConsents = require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-consents.model'));
const ConsentLocale = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent-locale.model'));
const ConsentCategory = require(path.join(process.cwd(), 'src/modules/privacy/consent-category/server/consent-category.model'));

async function syncHcpConsentsInVeeva(hcp, actor) {
    if(!hcp.individual_id_onekey) return;

    try {
        const hcp_consents = await HcpConsents.findAll({
            where: {
                user_id: hcp.id,
                consent_confirmed: true
            },
            attributes: ['id', 'consent_id', 'updated_at', 'veeva_multichannel_consent_id'],
            include: [{
                model: Consent,
                attributes: ['id'],
                include: [
                    {
                        model: ConsentCategory,
                        attributes: ['title', 'veeva_content_type_id']
                    },
                    {
                        model: ConsentLocale,
                        attributes: ['locale', 'rich_text', 'veeva_consent_type_id']
                    }
                ]
            }]
        });

        if(hcp_consents && hcp_consents.length) {
            const serviceUrl = nodecache.getValue('SALESFORCE_SERVICE_URL');

            const auth = async function() {
                const grant_type = 'password';
                const client_id = nodecache.getValue('SALESFORCE_SERVICE_CLIENT_ID');;
                const client_secret = nodecache.getValue('SALESFORCE_SERVICE_CLIENT_SECRET');
                const username = nodecache.getValue('SALESFORCE_SERVICE_USERNAME');
                const password = nodecache.getValue('SALESFORCE_SERVICE_PASSWORD');

                const { data } = await axios.post(`${serviceUrl}/oauth2/token?grant_type=${grant_type}&client_id=${client_id}&client_secret=${client_secret}&username=${username}&password=${password}`);

                return data.access_token;
            };

            const access_token = await auth();
            const headers = { authorization: `Bearer ${access_token}` };

            const query = `SELECT + Id, Name, PersonEmail, Secondary_Email__c,
                (SELECT + Id + FROM + Multichannel_Consent_vod__r) +
                FROM + Account + WHERE + QIDC__OneKeyId_IMS__c = '${hcp.individual_id_onekey}'`;
            const account_response = await axios.get(`${serviceUrl}/data/v48.0/query?q=${query}`, { headers });
            const account = account_response.data.totalSize ? account_response.data.records[0] : null;

            if(!account) return;

            if(!account.PersonEmail) {
                await axios.patch(`${serviceUrl}/data/v48.0/sobjects/Account/${account.Id}`, { PersonEmail: hcp.email}, { headers });
            }

            if(account.PersonEmail && account.PersonEmail != hcp.email && !account.Secondary_Email__c) {
                await axios.patch(`${serviceUrl}/data/v48.0/sobjects/Account/${account.Id}`, { Secondary_Email__c: hcp.email }, { headers });
            }

            const account_multichannel_consents = account.Multichannel_Consent_vod__r?.records;

            await Promise.all(hcp_consents.map(async hcp_consent => {
                const multichannel_consent = account_multichannel_consents && account_multichannel_consents.find(x => x.Id === hcp_consent.veeva_multichannel_consent_id);

                if(!multichannel_consent) {
                    const locale = hcp_consent.consent.consent_locales.find(x => x.locale === hcp.locale);
                    const rich_text = locale ? locale.dataValues.rich_text : '';

                    const { data } = await axios.post(`${serviceUrl}/data/v48.0/sobjects/Multichannel_Consent_vod__c`, {
                        Account_vod__c: account.Id,
                        RecordTypeId: '0124J000000ouUlQAI',
                        Capture_Datetime_vod__c: hcp_consent.updated_at,
                        Channel_Value_vod__c: hcp.email,
                        Opt_Type_vod__c: hcp_consent.opt_type === 'opt-out' ? 'Opt_Out_vod' : 'Opt_In_vod',
                        Content_Type_vod__c: hcp_consent.consent.consent_category.veeva_content_type_id,
                        GLPG_Consent_Source__c: hcp_consent.consent_source,
                        CDP_Consent_ID__c: hcp_consent.consent_id,
                        Consent_Type_vod__c: locale ? locale.dataValues.veeva_consent_type_id : null,
                        Default_Consent_Text_vod__c: parser(rich_text).replace(/(<\/?(?:a)[^>]*>)|<[^>]+>/ig, '$1')
                    }, { headers });

                    const hcpConsent = await HcpConsents.findOne({ where: { id: hcp_consent.id }});
                    await hcpConsent.update({ veeva_multichannel_consent_id: data.id });

                    auditService.log({
                        event_type: 'UPDATE',
                        object_id: hcp.id,
                        table_name: 'hcp_consents',
                        actor: actor.id
                    });

                    if(hcpConsent.opt_type === 'opt-out') {
                        const multichannel_consents = account_multichannel_consents && account_multichannel_consents.find(x => x.CDP_Consent_ID__c === hcp_consent.id);
                        await Promise.all(multichannel_consents.map(async multichannel_consent => {
                            await axios.patch(`${serviceUrl}/data/v48.0/sobjects/Multichannel_Consent_vod__c/${multichannel_consent.Id}`, { Opt_Expiration_Date_vod__c: new Date(Date.now()) }, { headers });
                        }));
                    }
                }
            }));
        }
    } catch(err) {
        logger.error(err);
    }
}

exports.syncHcpConsentsInVeeva = syncHcpConsentsInVeeva;
