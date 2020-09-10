import Types from "./consent.types";

const initialState = {
    consents: {}
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_CONSENTS_REPORT_FULFILLED: {
            return {
                ...state,
                consents: action.payload.data.data
            };
        }
    }
    return state;
}

