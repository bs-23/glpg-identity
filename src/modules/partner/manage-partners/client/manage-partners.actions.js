import axios from 'axios';
import Types from './manage-partners.types';

export function getHcpPartners(query = '') {
    return {
        type: Types.GET_PARTNER,
        payload: axios({
            method: 'get',
            url: `/api/partner/hcp${query}`
        })
    };
}


export function createHcpPartner(data) {
    return {
        type: Types.POST_PARTNER,
        payload: axios({
            method: 'post',
            url: `/api/partner/hcp/`,
            data
        })
    };
}

export function updateHcpPartner(id, data) {
    return {
        type: Types.UPDATE_PARTNER,
        payload: axios({
            method: 'put',
            url: `/api/partner/hcp/${id}`,
            data
        })
    };
}


export function getHcoPartners(query = '') {
    return {
        type: Types.GET_PARTNER,
        payload: axios({
            method: 'get',
            url: `/api/partner/hco${query}`
        })
    };
}

export function createHcoPartner(data) {
    return {
        type: Types.POST_PARTNER,
        payload: axios({
            method: 'post',
            url: `/api/partner/hco/`,
            data
        })
    };
}

export function updateHcoPartner(id, data) {
    return {
        type: Types.UPDATE_PARTNER,
        payload: axios({
            method: 'put',
            url: `/api/partner/hco/${id}`,
            data
        })
    };
}
