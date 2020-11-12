import axios from 'axios';
import Types from './user.types';

export function getSignedInUserProfile() {
    return {
        type: Types.GET_PROFILE,
        payload: axios({
            method: 'get',
            url: '/api/users/profile'
        })
    };
}

export function updateSignedInUserProfile(data) {
    return {
        type: Types.UPDATE_PROFILE,
        payload: axios({
            method: 'put',
            url: '/api/users/profile',
            data
        })
    };
}

export function login(data) {
    return {
        type: Types.LOGIN,
        payload: axios({
            method: 'post',
            url: '/api/login',
            data
        })
    };
}

export function createUser(data) {
    return {
        type: Types.CREATE_USER,
        payload: axios({
            method: 'post',
            url: '/api/users',
            data
        })
    };
}

export function changePassword(data) {
    return {
        type: Types.CHANGE_PASSWORD,
        payload: axios({
            method: 'post',
            url: '/api/users/change-password',
            data
        })
    };
}

export function getUsers(page = 1, codbase, orderBy, orderType) {
    const url = `/api/users?page=${page}`
        + (codbase ? `&codbase=${codbase}` : '')
        + (orderBy && orderBy !== 'null' ? `&orderBy=${orderBy}` : '')
        + (orderType && orderType !== 'null' ? `&orderType=${orderType}` : '');

    return {
        type: Types.GET_USERS,
        payload: axios({
            method: 'get',
            url: url,
        })
    };
}


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

export function cdpSort(type, val) {
    return {
        type: Types.SORT_USERS,
        payload: {
            type: type,
            val: val
        }
    };
}
