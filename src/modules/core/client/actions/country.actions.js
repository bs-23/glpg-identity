import axios from 'axios';
import Types from '../types/country.types';

export function getCountryList() {
    return {
        type: Types.GET_COUNTRY_LIST,
        payload: axios({
            method: 'get',
            url: '/countries'
        }),
    };
}
