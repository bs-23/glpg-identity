import axios from 'axios';
import Types from './country.types';

export function getCountryList() {
    return {
        type: Types.GET_COUNTRY_LIST,
        payload: axios({
            method: 'get',
            url: '/countries'
        }),
    };
}
