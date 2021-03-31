import axios from 'axios';
import Types from './import-consents.types';

export function getConsentImportJobs() {
    return {
        type: Types.GET_CONSENT_IMPORT_JOBS,
        payload: axios({
            method: 'get',
            url: `/api/consent-import-jobs`
        })
    };
}

export function cancelConsentImportJob(id) {
    return {
        type: Types.CANCEL_CONSENT_IMPORT_JOB,
        payload: axios({
            method: 'put',
            url: `/api/consent-import-jobs/${id}`
        })
    };
}
