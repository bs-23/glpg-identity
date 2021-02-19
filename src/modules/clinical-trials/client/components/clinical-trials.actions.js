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

