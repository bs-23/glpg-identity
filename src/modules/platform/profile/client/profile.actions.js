import axios from 'axios';
import types from './profile.types';

export function getProfiles () {
    const url = '/api/profiles';

    return {
        type: types.GET_PROFILES,
        payload: axios({
            method: 'get',
            url
        })
    }
}
