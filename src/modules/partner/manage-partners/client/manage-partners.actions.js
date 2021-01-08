import axios from 'axios';
import Types from './manage-partners.types';

export function getPartnerRequests(query = '') {
    return {
        type: Types.GET_PARTNER_REQUESTS,
        payload: axios({
            method: 'get',
            url: `/api/partner-requests${query}`
        })
    };
}

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
