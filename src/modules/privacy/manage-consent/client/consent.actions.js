import axios from 'axios';
import Types from './consent.types';

export function getCdpConsents(translations, category) {
    const search_params = new URLSearchParams('');

    translations && search_params.append('translations', translations);
    category && search_params.append('category', category);

    const url = `/api/cdp-consents${search_params.toString() !== '' ? '?' + search_params.toString() : ''}`;

    return {
        type: Types.GET_CDP_CONSENTS,
        payload: axios({
            method: 'get',
            url
        })
    };
}

export function createConsent(data) {
    return {
        type: Types.CREATE_CONSENT,
        payload: axios({
            method: 'post',
            url: '/api/cdp-consents',
            data
        })
    };
}

export function updateConsent(data, id){
    return {
        type: Types.UPDATE_CONSENT,
        payload: axios({
            method: 'put',
            url: `/api/cdp-consents/${id}`,
            data
        })
    };
}

export function getConsent(id) {
    return {
        type: Types.GET_CONSENT,
        payload: axios({
            method: 'get',
            url: `/api/cdp-consents/${id}`
        })
    };
}

export function setConsent(consent) {
    return {
        type: Types.SET_CONSENT,
        payload: consent
    };
}
