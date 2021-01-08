import Types from "./manage-partners.types";

const initialState = {
    partnerRequests: [],
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
        case Types.GET_PARTNER_REQUEST_FULFILLED: {
            return {
                ...state,
                partnerRequest: action.payload.data
            };
        }
        case Types.POST_PARTNER_REQUEST_FULFILLED: {
            return {
                ...state,
                partnerRequests: state.partnerRequests.concat(action.payload.data)
            };
        }
        case Types.UPDATE_PARTNER_REQUEST_FULFILLED: {
            const requests = [...state.partnerRequests];
            const idx = requests.findIndex(request => request.id === action.payload.data.id);
            requests.splice(idx, 1, action.payload.data);

            return {
                ...state,
                partnerRequests: requests
            };
        }
        case Types.DELETE_PARTNER_REQUEST_FULFILLED: {
            const requests = [...state.partnerRequests];
            const idx = requests.findIndex(request => request.id === action.payload.data.id);
            requests.splice(idx, 1);

            return idx === -1 ? { ...state } : { ...state, partnerRequests: requests };
        }
    }
    return state;
}
