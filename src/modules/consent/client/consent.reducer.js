import Types from "./consent.types";

const initialState = {
    consents: {},
    veeva_consents: {},
    cdp_consents: [],
    country_consents: [],
    consent: null
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

        case Types.GET_COUNTRY_CONSENTS_FULFILLED: {
            return {
                ...state,
                country_consents: action.payload.data
            }
        }

        case Types.DELETE_COUNTRY_CONSENT_FULFILLED: {
            const id = action.payload.config.url.split("/api/consent/country/")[1];
            return {
                ...state,
                country_consents: state.country_consents.filter(x => x.id !== id)
            }
        }

        case Types.UPDATE_COUNTRY_CONSENT_FULFILLED: {
            const id = action.payload.config.url.split("/api/consent/country/")[1];
            state.country_consents.find(x => x.id === id).opt_type = action.payload.data.opt_type;
            return {
                ...state,
                country_consents: state.country_consents
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

        case Types.CREATE_COUNTRY_CONSENT_FULFILLED: {
            console.log([...state.country_consents, action.payload.data]);
            return {
                ...state,
                country_consents: [...state.country_consents, action.payload.data]
            }
        }

        case Types.DELETE_CONSENT_FULFILLED: {
            const id = action.payload.config.url.split("/api/cdp-consents/")[1];
            return {
                ...state,
                cdp_consents: state.cdp_consents.filter(consent => consent.id !== id)
            }
        }
    }
    return state;
}
