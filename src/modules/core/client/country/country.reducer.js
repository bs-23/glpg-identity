import Types from './country.types';

const initialState = {
    countries: [],
    allCountries: []
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_COUNTRIES_FULFILLED: {
            return {
                ...state,
                countries: action.payload.data
            };
        }

        case Types.GET_ALL_COUNTRIES_FULFILLED: {
            const allCountries = action.payload.data;
            const countries = allCountries.filter(c => c.codbase_desc === c.countryname)
            return {
                ...state,
                countries: countries,
                allCountries: allCountries
            };
        }
    }
    return state;
}
