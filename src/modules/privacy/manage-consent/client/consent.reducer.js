import Types from "./consent.types";

const initialState = {
    cdp_consents: [],
    consent: null
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_CDP_CONSENTS_FULFILLED: {
            return {
                ...state,
                cdp_consents: action.payload.data
            }
        }

        case Types.GET_CONSENT_FULFILLED: {
            return {
                ...state,
                consent: action.payload.data
            }
        }

        case Types.SET_CONSENT: {
            return {
                ...state,
                consent: action.payload
            }
        }
    }
    return state;
}
