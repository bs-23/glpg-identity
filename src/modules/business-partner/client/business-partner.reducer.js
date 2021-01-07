import Types from "./business-partner.types";

const initialState = {
    partnerRequests: [],
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_PARTNER_REQUESTS_FULFILLED: {
            return {
                ...state,
                partnerRequests: action.payload.data
            };
        }
    }
    return state;
}
