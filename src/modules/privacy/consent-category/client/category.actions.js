import axios from 'axios';
import Types from './category.types';

export function getConsentCategory(id) {
    return {
        type: Types.GET_CONSENT_CATEGORY,
        payload: axios({
            method: 'get',
            url: `/api/privacy/consent-categories/${id}`
        })
    };
}

export function getConsentCategories() {
    return {
        type: Types.GET_CONSENT_CATEGORIES,
        payload: axios({
            method: 'get',
            url: '/api/privacy/consent-categories'
        })
    };
}

export function createConsentCategory(data) {
    return {
        type: Types.POST_CONSENT_CATEGORY,
        payload: axios({
            method: 'post',
            url: '/api/privacy/consent-categories',
            data
        })
    };
}

export function updateConsentCategory(id, data) {
    return {
        type: Types.PUT_CONSENT_CATEGORY,
        payload: axios({
            method: 'put',
            url: `/api/privacy/consent-categories/${id}`,
            data
        })
    };
}
