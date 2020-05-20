import Types from "../types/country.types";

const initialState = {
    countries: []
}

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_COUNTRY_LIST: {
            return {
                ...state,
                countries: action.payload.data
            };
        }
    }
    return state;
}
