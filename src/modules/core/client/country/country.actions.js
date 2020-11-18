import axios from 'axios';
import Types from './country.types';
import store from '../../client/store';

export function getCountries() {
    let { countries } = store.getState().countryReducer;
    if (countries && countries.length) {
        return {
            type: Types.GET_COUNTRIES_FULFILLED,
            payload: { data: countries }
        };
    }
    return {
        type: Types.GET_COUNTRIES,
        payload: axios({
            method: 'get',
            url: '/api/countries',
        })
    };
}

export function getAllCountries() {
    let { allCountries: countries } = store.getState().countryReducer;
    if (countries && countries.length) {
        return {
            type: Types.GET_ALL_COUNTRIES_FULFILLED,
            payload: { data: countries }
        };
    }
    return {
        type: Types.GET_ALL_COUNTRIES,
        payload: axios({
            method: 'get',
            url: '/api/all_countries',
        })
    };
}
