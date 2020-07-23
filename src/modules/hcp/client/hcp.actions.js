import axios from 'axios';
import Types from './hcp.types';

export function getHcpProfiles(page, status, country_iso2) {
    return {
        type: Types.GET_HCPS,
        payload: axios({
            method: 'get',
            url: `/api/hcps?page=${page}&status=${status}&country_iso2=${country_iso2}`
        })
    };
}

export function editHcpProfiles(data, id) {
    return {
        type: Types.EDIT_HCPS,
        payload: axios({
            method: 'put',
            url: '/api/hcps/' + id,
            data
        })
    };
}

export function hcpsSort(type, val) {
    return {
        type: Types.SORT_HCPS,
        payload: {
            type: type,
            val: val
        }
    };
}
