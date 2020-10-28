import Types from './country.types';

const initialState = {
    countries: []
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_COUNTRIES_FULFILLED: {
            return {
                ...state,
                countries: action.payload.data
            };
        }
    }
    return state;
}
