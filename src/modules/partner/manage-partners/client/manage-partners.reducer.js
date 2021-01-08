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
        case Types.POST_PARTNER_REQUEST_FULFILLED: {
            return {
                ...state,
                partnerRequests: state.partnerRequests.concat(action.payload.data)
            };
        }
    }
    return state;
}
