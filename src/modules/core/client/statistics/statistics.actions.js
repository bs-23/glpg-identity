import axios from 'axios';
import Types from './statistics.types';

export function getStatistics(query = '') {
    return {
        type: Types.GET_STATISTICS,
        payload: axios({
            method: 'get',
            url: `/api/statistics${query}`
        })
    };
}
