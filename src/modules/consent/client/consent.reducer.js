import Types from "./consent.types";

const initialState = {
    consents: {},
    veeva_consents: {},
    cdp_consents: {},
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

        case Types.GET_CDP_CONSENTS_FULFILLED: {
            return {
                ...state,
                cdp_consents: action.payload.data
            }
        }
    }
    return state;
}

