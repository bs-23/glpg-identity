import axios from 'axios';
import Types from './import-consents.types';

export function getImportedConsents() {
    return {
        type: Types.GET_IMPORTED_CONSENT_DATA,
        payload: axios({
            method: 'get',
            url: `/api/consent/imported-hcp-consents`
        })
    };
}

