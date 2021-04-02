import axios from 'axios';
import Types from './manage-partners.types';

export function getHcpPartners(query = '') {
    query = !query ? '?type=hcp' : query + '&type=hcp';
    return {
        type: Types.GET_PARTNER,
        payload: axios({
            method: 'get',
            url: `/api/partners${query}`
        })
    };
}

export function getHcoPartners(query = '') {
    query = !query ? '?type=hco' : query + '&type=hco';
    return {
        type: Types.GET_PARTNER,
        payload: axios({
            method: 'get',
            url: `/api/partners${query}`
        })
    };
}

export function getVendorsPartners(query = '') {
    return {
        type: Types.GET_PARTNER,
        payload: axios({
            method: 'get',
            url: `/api/partners/vendors${query}`
        })
    };
}

export function getWholesalePartners(query = '') {
    return {
        type: Types.GET_PARTNER,
        payload: axios({
            method: 'get',
            url: `/api/partners/wholesalers${query}`
        })
    };
}

export function getPartnerById(id, type) {
    return {
        type: Types.GET_PARTNER_BY_ID,
        payload: axios({
            method: 'get',
            url: `/api/partners/information/${type}/${id}`
        })
    };
}

export function approveBusinessPartner(id, type) {
    return {
        type: Types.GET_USER_APPROVE,
        payload: axios({
            method: 'get',
            url: `/api/partners/approve/${type}/${id}`
        })
    };
}

export function resendFormForCorrection(id, type,data) {
    return {
        type: Types.RESEND_FORM,
        payload: axios({
            method: 'put',
            url: `/api/partners/${type}/${id}/resend-form`,
            data
        })
    };
}
