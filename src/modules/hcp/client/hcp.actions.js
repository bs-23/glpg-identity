import axios from 'axios';
import Types from './hcp.types';

export function getHcpProfiles(page, status, codbase) {
    const search_params = new URLSearchParams('');

    page && search_params.append('page', page);
    status && search_params.append('status', status);
    codbase && search_params.append('codbase', codbase);

    const url = `/api/hcps${search_params.toString() !== '' ? '?' + search_params.toString() : '' }`;

    return {
        type: Types.GET_HCPS,
        payload: axios({
            method: 'get',
            url
        })
    };
}

// export function editHcpProfiles(data, id) {
//     return {
//         type: Types.EDIT_HCPS,
//         payload: axios({
//             method: 'put',
//             url: '/api/hcps/' + id,
//             data
//         })
//     };
// }

export function hcpsSort(type, val) {
    return {
        type: Types.SORT_HCPS,
        payload: {
            type: type,
            val: val
        }
    };
}
