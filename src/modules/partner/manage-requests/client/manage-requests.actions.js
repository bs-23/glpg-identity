import axios from 'axios';
import Types from './manage-requests.types';

export function getPartnerRequests(query = '') {
    return {
        type: Types.GET_PARTNER_REQUESTS,
        payload: axios({
            method: 'get',
            url: `/api/partner-requests${query}`
        })
    };
}

export function getPartnerRequest(id) {
    return {
        type: Types.GET_PARTNER_REQUEST,
        payload: axios({
            method: 'get',
            url: `/api/partner-requests/${id}`,
        })
    };
}
export function sendForm(data) {
    return {
        type: Types.SEND_FORM,
        payload: axios({
            method: 'post',
            url: `/api/partner-requests/${data.id}/send-form`,
            data
        })
    };
};

export function createPartnerRequest(data) {
    return {
        type: Types.POST_PARTNER_REQUEST,
        payload: axios({
            method: 'post',
            url: `/api/partner-requests`,
            data
        })
    };
}

export function updatePartnerRequest(id, data) {
    return {
        type: Types.UPDATE_PARTNER_REQUEST,
        payload: axios({
            method: 'put',
            url: `/api/partner-requests/${id}`,
            data
        })
    };
}

export function deletePartnerRequest(id) {
    return {
        type: Types.DELETE_PARTNER_REQUEST,
        payload: axios({
            method: 'delete',
            url: `/api/partner-requests/${id}`,
        })
    };
}
