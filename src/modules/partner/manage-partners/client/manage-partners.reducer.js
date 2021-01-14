import Types from "./manage-partners.types";

const initialState = {
    partnersList: {},
    partner: {},
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_PARTNER_FULFILLED: {
            return {
                ...state,
                partnersList: action.payload.data
            };
        }
        case Types.GET_PARTNER_FULFILLED: {
            return {
                ...state,
                partner: action.payload.data
            };
        }
        case Types.POST_PARTNER_FULFILLED: {
            return {
                ...state,
                partnersList: state.partnersList.concat(action.payload.data)
            };
        }
        case Types.UPDATE_PARTNER_FULFILLED: {
            const requests = [...state.partnersList];
            const idx = requests.findIndex(request => request.id === action.payload.data.id);
            requests.splice(idx, 1, action.payload.data);

            return {
                ...state,
                partnersList: requests
            };
        }
        case Types.DELETE_PARTNER_FULFILLED: {
            const requests = [...state.partnersList];
            const idx = requests.findIndex(request => request.id === action.payload.data.id);
            requests.splice(idx, 1);

            return idx === -1 ? { ...state } : { ...state, partnersList: requests };
        }
    }
    return state;
}
