import axios from 'axios';
import Types from './clinical-trials.types';

export function getTrialtems(query = "") {
    return {
        type: Types.GET_TRIAL_ITEMS,
        payload: axios({
            method: 'get',
            url: `/api/faq${query}`
        })
    };
}

export function fetchTrialItem(id) {
    return {
        type: Types.GET_TRIAL_ITEM,
        payload: axios({
            method: 'get',
            url: `/api/clinical-trials/${id}`
        })
    };
}

