import axios from 'axios';
import Types from './statistics.types';
import store from '../../client/store';

export function getStatistics() {
    let { statistics } = store.getState().statisticsReducer;
    if (statistics !== undefined) {
        return {
            type: Types.GET_STATISTICS_FULFILLED,
            payload: { data: statistics }
        };
    }
    return {
        type: Types.GET_STATISTICS,
        payload: axios({
            method: 'get',
            url: '/api/statistics',
        })
    };
}
