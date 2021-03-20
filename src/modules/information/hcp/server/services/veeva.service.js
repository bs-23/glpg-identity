const path = require('path');
const axios = require('axios');
const parser = require('html-react-parser');
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const HcpConsents = require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-consents.model'));
const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model'));
const ConsentCategory = require(path.join(process.cwd(), 'src/modules/privacy/consent-category/server/consent-category.model'));
const ConsentLocale = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent-locale.model'));
const searchUrl = nodecache.getValue('SALESFORCE_SERVICE_URL');

async function existMultiChannelConsent(id, headers){
    try{
        await axios.get(`${searchUrl}/data/v48.0/sobjects/Multichannel_Consent_vod__c/${id}`, { headers });
        return true;
    }
    catch(err){
        logger.error(err);
        return false;
    }
}

async function syncHcpConsentsInVeeva(user) {
    if(!user.individual_id_onekey) return;

    try {
        const hcp_consents = await HcpConsents.findAll({
            where: {
                user_id: user.id,
                consent_confirmed: true,
            },
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
            }],
            attributes: ['id', 'consent_id', 'updated_at', 'veeva_multichannel_consent_id']
        });

        const auth = async function() {
            const grant_type = 'password';
            const client_id = nodecache.getValue('SALESFORCE_SERVICE_CLIENT_ID');;
            const client_secret = nodecache.getValue('SALESFORCE_SERVICE_CLIENT_SECRET');
            const username = nodecache.getValue('SALESFORCE_SERVICE_USERNAME');
            const password = nodecache.getValue('SALESFORCE_SERVICE_PASSWORD');

            const { data } = await axios.post(`${searchUrl}/oauth2/token?grant_type=${grant_type}&client_id=${client_id}&client_secret=${client_secret}&username=${username}&password=${password}`);

            return data.access_token;
        };

        const access_token = await auth();
        const headers = { authorization: `Bearer ${access_token}` };

        const query = `SELECT + Id, Name, PersonEmail, Secondary_Email__c + FROM + Account + WHERE + QIDC__OneKeyId_IMS__c = '${user.individual_id_onekey}'`;
        const account_response = await axios.get(`${searchUrl}/data/v48.0/query?q=${query}`, { headers });
        const account = account_response.data.totalSize ? account_response.data.records[0] : null;

        if(!account) return;

        if(!account.PersonEmail) {
            await axios.patch(`${searchUrl}/data/v48.0/sobjects/Account/${account.Id}`, { PersonEmail: user.email}, { headers });
        }

        if(account.PersonEmail && account.PersonEmail != user.email && !account.Secondary_Email__c) {
            await axios.patch(`${searchUrl}/data/v48.0/sobjects/Account/${account.Id}`, { Secondary_Email__c: user.email }, { headers });
        }

        if(hcp_consents && hcp_consents.length) {
            await Promise.all(hcp_consents.map(async hcp_consent => {
                let mcc;
                if(hcp_consent.veeva_multichannel_consent_id){
                    mcc = await existMultiChannelConsent(hcp_consent.veeva_multichannel_consent_id, headers);
                }

                if(!mcc){
                    const locale = hcp_consent.consent.consent_locales.filter(i => i.locale === user.locale);
                    const rich_text = locale && locale.length ? locale[0].dataValues.rich_text : '';

                    const { data } = await axios.post(`${searchUrl}/data/v48.0/sobjects/Multichannel_Consent_vod__c`, {
                        Account_vod__c: account.Id,
                        RecordTypeId: '0124J000000ouUlQAI',
                        Capture_Datetime_vod__c: hcp_consent.updated_at,
                        Channel_Value_vod__c: user.email,
                        Opt_Type_vod__c: 'Opt_In_vod',
                        Content_Type_vod__c: hcp_consent.consent.consent_category.veeva_content_type_id,
                        GLPG_Consent_Source__c: 'Website',
                        CDP_Consent_ID__c: hcp_consent.consent_id,
                        Consent_Type_vod__c: locale && locale.length ? locale[0].dataValues.veeva_consent_type_id : null,
                        Default_Consent_Text_vod__c: parser(rich_text).replace(/(<\/?(?:a)[^>]*>)|<[^>]+>/ig, '$1')
                    }, { headers });

                    const hcpConsent = await HcpConsents.findOne({ where: { id: hcp_consent.id }});
                    await hcpConsent.update({ veeva_multichannel_consent_id: data.id });
                }
            }));
        }
    } catch(err) {
        logger.error(err);
    }
}

exports.syncHcpConsentsInVeeva = syncHcpConsentsInVeeva;
