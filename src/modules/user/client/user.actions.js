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

export function getUsers(page = 1, country_iso2) {
    return {
        type: Types.GET_USERS,
        payload: axios({
            method: 'get',
            url: `/api/users?page=${page}&country_iso2=${country_iso2}`,
        })
    };
}

export function deleteUser(id) {
    return {
        type: Types.DELETE_USER,
        payload: axios({
            method: 'delete',
            url: `/api/users/${id}`
        })
    };
}
