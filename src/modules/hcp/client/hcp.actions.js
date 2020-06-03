import axios from 'axios';
import Types from './hcp.types';

export function getHcpUserList() {
    return {
        type: Types.GET_HCP_USER_LIST,
        payload: axios({
            method: 'get',
            url: '/hcp-users',
        }),
    };
}
