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
    }
}

export function getMultipleClinicalTrialDetails(ids) {
    let trials = []
    ids.map(id=>{
        const url = `/api/clinical-trials-cdp/${id}`;
        axios({
            method: 'get',
            url
        }).then(res=> trials.push(res))
    })
    
    return {
        type: Types.GET_MULTIPLE_TRIAL_DETAILS,
        payload: trials
    }
}

export function getClinicalTrialDetails(ids) {
    
    const url = `/api/clinical-trials-cdp/${ids}`;
    return {
        type: Types.GET_TRIAL_DETAILS,
        payload: axios({
            method: 'get',
            url
        })
    }
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

export function getTrialConditions() {
    const url = `/api/clinical-trials/conditions-cdp`;
    return {
        type: Types.GET_TRIAL_CONDITIONS,
        payload:  axios({
            method: 'get',
            url
        })
    };
}


