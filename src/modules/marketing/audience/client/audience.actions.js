import axios from 'axios';
import Types from './audience.types';
import store from '../../../core/client/store';

export function getCampaigns(page = 1) {
    return {
        type: Types.GET_AUDIENCES,
        payload: axios({
            method: 'get',
            url: `/api/audiences?page=${page}`
        })
    };
}
