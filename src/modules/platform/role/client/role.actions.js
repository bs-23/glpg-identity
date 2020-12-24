import axios from 'axios';
import Types from './role.types';

export function getRoles() {
    return {
        type: Types.GET_ROLES,
        payload: axios({
            method: 'get',
            url: `/api/roles`,
        })
    };
}

export function createRole(data) {
    return {
        type: Types.CREATE_ROLE,
        payload: axios({
            method: 'post',
            url: '/api/roles',
            data
        })
    };
}
