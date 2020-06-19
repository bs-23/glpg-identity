import axios from 'axios';
import Types from './hcp.types';

export function getHcpProfiles() {
    return {
        type: Types.GET_HCPS,
        payload: axios({
            method: 'get',
            url: '/api/hcps'
        }),
    };
}
