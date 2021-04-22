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
const serviceUrl = nodecache.getValue('SALESFORCE_SERVICE_URL');

async function getAuthorizationHeader() {
    try {
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

        return headers;
    } catch(err) {
        logger.error(err);
    }
}

async function getAccountByOneKeyId(oneKeyId) {
    try {
        const headers = await getAuthorizationHeader();
        const query = `SELECT + Id, PersonEmail, Secondary_Email__c,
            (SELECT + Id, Consent_Type_vod__c, Channel_Value_vod__c, Opt_Expiration_Date_vod__c + FROM + Multichannel_Consent_vod__r) +
            FROM + Account + WHERE + QIDC__OneKeyId_IMS__c = '${oneKeyId}'`;
        const account_response = await axios.get(`${serviceUrl}/data/v48.0/query?q=${query}`, { headers });
        const account = account_response.data.totalSize ? account_response.data.records[0] : null;

        return account;
    } catch(err) {
        logger.error(err);
    }
}

async function syncHcpConsentsInVeeva(hcp, actor) {
    if(!hcp.individual_id_onekey) return;

    try {
        const hcp_consents = await HcpConsents.findAll({
            where: {
                user_id: hcp.id,
                opt_type: 'opt-in',
                expired_at: null
            },
            attributes: ['id', 'consent_id', 'created_at', 'veeva_multichannel_consent_id', 'consent_source'],
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
            const headers = await getAuthorizationHeader();
            const account = await getAccountByOneKeyId(hcp.individual_id_onekey);

            if(!account) return;

            if(await isEmailDifferent(account, hcp.email)) return;

            if(!account.PersonEmail) {
                await axios.patch(`${serviceUrl}/data/v48.0/sobjects/Account/${account.Id}`, { PersonEmail: hcp.email }, { headers });
            }

            const multichannel_consents = account.Multichannel_Consent_vod__r?.records;

            await Promise.all(hcp_consents.map(async hcp_consent => {
                const locale = hcp_consent.consent.consent_locales.find(x => x.locale === hcp.locale);

                if(hcp_consent.consent.consent_category.veeva_content_type_id && locale.dataValues.veeva_consent_type_id) {
                    const multichannel_consent = multichannel_consents && multichannel_consents.find(x => x.Consent_Type_vod__c === locale.dataValues.veeva_consent_type_id && !x.Opt_Expiration_Date_vod__c);

                    if(multichannel_consent) {
                        await axios.patch(`${serviceUrl}/data/v48.0/sobjects/Multichannel_Consent_vod__c/${multichannel_consent.Id}`, { Opt_Expiration_Date_vod__c: new Date(Date.now()) }, { headers });
                    }

                    const { data } = await axios.post(`${serviceUrl}/data/v48.0/sobjects/Multichannel_Consent_vod__c`, {
                        Account_vod__c: account.Id,
                        RecordTypeId: '0124J000000ouUlQAI',
                        Capture_Datetime_vod__c: hcp_consent.created_at,
                        Channel_Value_vod__c: hcp.email,
                        Channel_Source_vod__c: 'Account.PersonEmail',
                        Opt_Type_vod__c: hcp_consent.opt_type === 'opt-out' ? 'Opt_Out_vod' : 'Opt_In_vod',
                        Content_Type_vod__c: hcp_consent.consent.consent_category.veeva_content_type_id,
                        GLPG_Consent_Source__c: hcp_consent.consent_source,
                        CDP_Consent_ID__c: hcp_consent.consent_id,
                        Consent_Type_vod__c: locale.dataValues.veeva_consent_type_id,
                        Default_Consent_Text_vod__c: parser(locale.dataValues.rich_text).replace(/(<\/?(?:a)[^>]*>)|<[^>]+>/ig, '$1')
                    }, { headers });

                    const hcpConsent = await HcpConsents.findOne({ where: { id: hcp_consent.id }});
                    const previousConsentValue = {...hcpConsent.dataValues};

                    await hcpConsent.update({ veeva_multichannel_consent_id: data.id });

                    const updatesInConsent = auditService.difference(hcpConsent.dataValues, previousConsentValue);

                    auditService.log({
                        event_type: 'UPDATE',
                        object_id: hcp.id,
                        table_name: 'hcp_consents',
                        actor: actor.id,
                        changes: updatesInConsent
                    });
                }
            }));
        }
    } catch(err) {
        logger.error(err);
    }
}

async function createMultiChannelConsent(account, email, opt_type, consent_source, consent, captured_date, legalText) {
    try {
        if(account && email && consent &&
            consent.consent_category &&
            consent.consent_category.veeva_content_type_id &&
            consent.consent_locales &&
            consent.consent_locales[0].veeva_consent_type_id &&
            legalText) {

            const headers = await getAuthorizationHeader();

            const veeva_content_type_id = consent.consent_category.veeva_content_type_id;
            const veeva_consent_type_id = consent.consent_locales[0].veeva_consent_type_id;

            let multichannel_consents = account.Multichannel_Consent_vod__r?.records;
            multichannel_consents = multichannel_consents && multichannel_consents.filter(x => x.Consent_Type_vod__c === veeva_consent_type_id && !x.Opt_Expiration_Date_vod__c);

            if(!account.PersonEmail) {
                await axios.patch(`${serviceUrl}/data/v48.0/sobjects/Account/${account.Id}`, { PersonEmail: email.toLowerCase() }, { headers });
            }

            if(multichannel_consents) {
                await Promise.all(multichannel_consents.map(async mc => {
                    await axios.patch(`${serviceUrl}/data/v48.0/sobjects/Multichannel_Consent_vod__c/${mc.Id}`, { Opt_Expiration_Date_vod__c: new Date(Date.now()) }, { headers });
                }));
            }

            const { data } = await axios.post(`${serviceUrl}/data/v48.0/sobjects/Multichannel_Consent_vod__c`, {
                Account_vod__c: account.Id,
                RecordTypeId: '0124J000000ouUlQAI',
                Capture_Datetime_vod__c: new Date(captured_date),
                Channel_Value_vod__c: email.toLowerCase(),
                Channel_Source_vod__c: 'Account.PersonEmail',
                Opt_Type_vod__c: opt_type === 'opt-out' ? 'Opt_Out_vod' : 'Opt_In_vod',
                Content_Type_vod__c: veeva_content_type_id,
                GLPG_Consent_Source__c: consent_source,
                CDP_Consent_ID__c: consent.id,
                Consent_Type_vod__c: veeva_consent_type_id,
                Default_Consent_Text_vod__c: parser(legalText).replace(/(<\/?(?:a)[^>]*>)|<[^>]+>/ig, '$1')
            }, { headers });

            return data;
        }
    } catch(err) {
        logger.error(err);
    }
}

async function isEmailDifferent(account, email) {
    try {
        email = email.toLowerCase();

        if(account.PersonEmail && account.PersonEmail.toLowerCase() !== email) return true;
        if(account.Secondary_Email__c && account.Secondary_Email__c.toLowerCase() !== email) return true;

        if(!account.Multichannel_Consent_vod__r) return false;

        let result = false;
        account.Multichannel_Consent_vod__r.records.forEach(mc => {
            if(mc.Channel_Value_vod__c && mc.Channel_Value_vod__c.toLowerCase() !== email) { result = true; }
        });

        return result;
    } catch(err) {
        logger.error(err);
    }
}

exports.syncHcpConsentsInVeeva = syncHcpConsentsInVeeva;
exports.getAccountByOneKeyId = getAccountByOneKeyId;
exports.createMultiChannelConsent = createMultiChannelConsent;
exports.isEmailDifferent = isEmailDifferent;
