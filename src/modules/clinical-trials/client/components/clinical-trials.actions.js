import axios from 'axios';
import Types from './clinical-trials.types';


export function fetchTrialItem(id) {
    return {
        type: Types.GET_TRIAL_ITEM,
        payload: {
            title : 'Changed trial title',
            age : 20,
            gender: 'male'
        }
    };
}


export function getTrialItems() {
    const url = `/api/clinical-trials-cdp`;
    return {
        type: Types.GET_TRIAL_ITEMS,
        payload:  axios({
            method: 'get',
            url
        })
    };
}