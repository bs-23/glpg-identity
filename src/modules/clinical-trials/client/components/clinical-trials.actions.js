import axios from 'axios';
import Types from './clinical-trials.types';


export function fetchTrialItem(id) {
    return {
        type: Types.GET_TRIAL_ITEM,
        // payload: axios({
        //     method: 'get',
        //     url: `/api/clinical-trials/${id}`
        // })
        payload: {
            title : 'Changed trial title',
            age : 20,
            gender: 'male'
        }
    };
}

export function getClinicalTrialDetails() {
    let id = prompt("set your id:", 'bf3fcdd9-2c14-4a1e-b02c-787c379c0aa9');
    const url = `/api/clinical-trials-cdp/${id}`;
    return {
        type: Types.GET_TRIAL_DETAILS,
        payload: axios({
            method: 'get',
            url
        })
    };
}

