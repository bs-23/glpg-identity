import axios from 'axios';
import Types from './consent-country.types';

export function getCountryConsents() {
    const url = '/api/consent/country/';
    return {
        type: Types.GET_COUNTRY_CONSENTS,
        payload: axios({
            method: 'get',
            url
        })
    };
}

export function deleteCountryConsent(id) {
    const url = `/api/consent/country/${id}`;
    return {
        type: Types.DELETE_COUNTRY_CONSENT,
        payload: axios({
            method: 'delete',
            url
        })
    };
}

export function updateCountryConsent(id, data) {
    const url = `/api/consent/country/${id}`;
    return {
        type: Types.UPDATE_COUNTRY_CONSENT,
        payload: axios({
            method: 'put',
            url,
            data
        })
    };
}

export function createCountryConsent(data) {
    return {
        type: Types.CREATE_COUNTRY_CONSENT,
        payload: axios({
            method: 'post',
            url: '/api/consent/country',
            data
        })
    };
}
