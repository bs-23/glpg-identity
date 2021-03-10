import axios from 'axios';
import Types from './statistics.types';
import store from '../../client/store';

export function getHotStatistics() {
    return {
        type: Types.GET_STATISTICS,
        payload: axios({
            method: 'get',
            url: '/api/statistics',
        })
    };
}
