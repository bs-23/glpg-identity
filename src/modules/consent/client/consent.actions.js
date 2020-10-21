import axios from 'axios';
import Types from './consent.types';

export function getConsentReport(page, codbase, process_activity, opt_type, orderBy, orderType) {
    const search_params = new URLSearchParams('');

    page && search_params.append('page', page);
    codbase && search_params.append('codbase', codbase);
    process_activity && search_params.append('process_activity', process_activity);
    opt_type && search_params.append('opt_type', opt_type);
    orderBy && search_params.append('orderBy', orderBy);
    orderType && search_params.append('orderType', orderType);

    const url = `/api/consent-performance-report${search_params.toString() !== '' ? '?' + search_params.toString() : ''}`;

    return {
        type: Types.GET_CONSENTS_REPORT,
        payload: axios({
            method: 'get',
            url
        })
    };
}

export function getVeevaConsentReport(page, codbase, process_activity, opt_type, orderBy, orderType) {
    const search_params = new URLSearchParams('');

    page && search_params.append('page', page);
    codbase && search_params.append('codbase', codbase);
    process_activity && search_params.append('process_activity', process_activity);
    opt_type && search_params.append('opt_type', opt_type);
    orderBy && search_params.append('orderBy', orderBy);
    orderType && search_params.append('orderType', orderType);

    const url = `/api/datasync-consent-performance-report${search_params.toString() !== '' ? '?' + search_params.toString() : ''}`;

    return {
        type: Types.GET_VEEVA_CONSENTS_REPORT,
        payload: axios({
            method: 'get',
            url
        })
    };
}

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

export function deleteConsent(id) {
    const url = `/api/cdp-consents/${id}`;
    return {
        type: Types.DELETE_CONSENT,
        payload: axios({
            method: 'delete',
            url
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