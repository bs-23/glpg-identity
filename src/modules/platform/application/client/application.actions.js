import axios from 'axios';
import Types from './applications.types';

export function getApplications() {
    return {
        type: Types.GET_APPLICATIONS,
        payload: axios({
            method: 'get',
            url: `/api/applications`
        })
    };
}
