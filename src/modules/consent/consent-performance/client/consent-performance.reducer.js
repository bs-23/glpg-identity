import Types from "./consent-performace.types";

const initialState = {
    consents: {},
    veeva_consents: {}
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_CONSENTS_REPORT_FULFILLED: {

            return {
                ...state,
                consents: action.payload.data.data
            };
        }

        case Types.GET_VEEVA_CONSENTS_REPORT_FULFILLED: {
            return {
                ...state,
                veeva_consents: action.payload.data.data
            }
        }
    }
    return state;
}
