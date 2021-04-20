import axios from 'axios';
import Types from './campaign.types';
import store from '../../../core/client/store';

export function getCampaigns(page = 1) {
    return {
        type: Types.GET_CAMPAIGNS,
        payload: axios({
            method: 'get',
            url: `/api/campaigns?page=${page}`
        })
    };
}
