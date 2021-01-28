import axios from 'axios';
import Types from './manage-partners.types';

export function getHcpPartners(query = '') {
    return {
        type: Types.GET_PARTNER,
        payload: axios({
            method: 'get',
            url: `/api/partners/hcps${query}`
        })
    };
}


export function createHcpPartner(data) {
    return {
        type: Types.POST_PARTNER,
        payload: axios({
            method: 'post',
            url: `/api/partners/hcps/`,
            data
        })
    };
}

export function updateHcpPartner(id, data) {
    return {
        type: Types.UPDATE_PARTNER,
        payload: axios({
            method: 'put',
            url: `/api/partners/hcps/${id}`,
            data
        })
    };
}


export function getHcoPartners(query = '') {
    return {
        type: Types.GET_PARTNER,
        payload: axios({
            method: 'get',
            url: `/api/partners/hcos${query}`
        })
    };
}

export function createHcoPartner(data) {
    return {
        type: Types.POST_PARTNER,
        payload: axios({
            method: 'post',
            url: `/api/partners/hcos/`,
            data
        })
    };
}

export function updateHcoPartner(id, data) {
    return {
        type: Types.UPDATE_PARTNER,
        payload: axios({
            method: 'put',
            url: `/api/partners/hcos/${id}`,
            data
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
            url: `/api/partners/${type}/${id}`
        })
    };
}

export function approveUser(id, type) {
    return {
        type: Types.GET_USER_APPROVE,
        payload: axios({
            method: 'get',
            url: `/api/partners/approve/${type}/${id}`
        })
    };
}

