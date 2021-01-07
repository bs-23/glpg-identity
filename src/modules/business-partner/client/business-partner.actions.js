import axios from 'axios';
import Types from './business-partner.types';

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
        type: Types.GET_PARTNER_REQUESTS,
        payload: axios({
            method: 'post',
            url: `/api/partner-requests`,
            data
        })
    };
}
