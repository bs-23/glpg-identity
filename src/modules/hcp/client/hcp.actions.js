import axios from 'axios';
import Types from './hcp.types';

export function getHcpProfiles(page = 1, status, codbase, orderBy, orderType) {
    if (status && status.indexOf(',') !== -1) {
        status = status.split(',');
    }

    const url = `/api/hcps?page=${page}` + (status ? `&status=${status}` : '') + (codbase && codbase !== 'null' ? `&codbase=${codbase}` : '') + ((orderBy && orderType && orderBy !== 'null' && orderType !== 'null') ? `&orderBy=${orderBy}&orderType=${orderType}` : '');

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
