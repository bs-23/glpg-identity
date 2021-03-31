import axios from 'axios';
import Types from './import-consents.types';

export function getConsentImportRecords() {
    return {
        type: Types.GET_CONSENT_IMPORT_RECORDS,
        payload: axios({
            method: 'get',
            url: `/api/consent-import/records`
        })
    };
}
