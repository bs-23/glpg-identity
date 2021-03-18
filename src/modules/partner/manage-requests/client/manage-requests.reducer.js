import Types from "./manage-requests.types";

const initialState = {
    partnerRequests: {},
    partnerRequest: {},
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_PARTNER_REQUESTS_FULFILLED: {
            return {
                ...state,
                partnerRequests: action.payload.data
            };
        }
        case Types.UPDATE_PARTNER_REQUEST_FULFILLED: {
            const partnerRequests = { ...state.partnerRequests };
            const idx = partnerRequests['partnerRequests'].findIndex(request => request.id === action.payload.data.id);
            partnerRequests['partnerRequests'].splice(idx, 1, action.payload.data);

            return {
                ...state,
                partnerRequests,
            }
        }
        case Types.GET_PARTNER_REQUEST_FULFILLED: {
            return {
                ...state,
                partnerRequest: action.payload.data
            };
        }
        case Types.SEND_FORM_FULFILLED: {
            return {
                ...state,
                sendForm: action.payload.data
            }
        }
        case Types.RESEND_FORM_FULFILLED: {
            return {
                ...state,
                resendForm: action.payload.data
            }
        }
    }
    return state;
}
