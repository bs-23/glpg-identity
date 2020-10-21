import axios from 'axios';
import Types from './preference.types';

export function getConsentPreference(id) {
    return {
        type: Types.GET_CONSENT_PREFERENCE,
        payload: axios({
            method: 'get',
            url: `/api/privacy/consent-preferences/${id}`
        })
    };
}

export function getConsentPreferences() {
    return {
        type: Types.GET_CONSENT_PREFERENCES,
        payload: axios({
            method: 'get',
            url: '/api/privacy/consent-preferences'
        })
    };
}

export function createConsentPreference(data) {
    return {
        type: Types.POST_CONSENT_PREFERENCE,
        payload: axios({
            method: 'post',
            url: '/api/privacy/consent-preferences',
            data
        })
    };
}

export function updateConsentPreference(id, data) {
    return {
        type: Types.PUT_CONSENT_PREFERENCE,
        payload: axios({
            method: 'put',
            url: `/api/privacy/consent-preferences/${id}`,
            data
        })
    };
}
