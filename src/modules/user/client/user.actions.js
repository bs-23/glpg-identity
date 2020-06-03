import axios from 'axios';
import Types from './user.types';

export function getSignedInUserProfile() {
    return {
        type: Types.GET_PROFILE,
        payload: axios({
            method: 'get',
            url: '/users/getSignedInUserProfile',
        }),
    };
}

export function login(data) {
    return {
        type: Types.LOGIN,
        payload: axios({
            method: 'post',
            url: '/login',
            data,
        }),
    };
}

export function createUser(data) {
    return {
        type: Types.CREATE_USER,
        payload: axios({
            method: 'post',
            url: '/users',
            data,
        }),
    };
}

export function changePassword(data) {
    return {
        type: Types.CHANGE_PASSWORD,
        payload: axios({
            method: 'post',
            url: '/users/changePassword',
            data,
        }),
    };
}

export function getSiteAdminList() {
    return {
        type: Types.GET_SITE_ADMIN_LIST,
        payload: axios({
            method: 'get',
            url: '/get_site_admin_list'
        })
    };
}

export function changeSiteAdminAccountStatus(data) {
    return {
        type: Types.CHANGE_SITE_ADMIN_ACCOUNT_STATUS,
        payload: axios({
            method: 'post',
            url: '/change_site_admin_account_status',
            data,
        }),
    };
}

export function deleteSiteAdminAccount(data){
    return {
        type: Types.DELETE_SITE_ADMIN_ACCOUNT,
        payload: axios({
            method: 'post',
            url: '/delete_site_admin_account',
            data,
        }),
    };
}
