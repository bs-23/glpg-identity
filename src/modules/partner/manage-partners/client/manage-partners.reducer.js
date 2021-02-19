import Types from "./manage-partners.types";

const initialState = {
    partnersData: {},
    partner: {},
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_PARTNER_FULFILLED: {
            return {
                ...state,
                partnersData: action.payload.data
            };
        }
        case Types.GET_PARTNER_BY_ID_FULFILLED: {
            return {
                ...state,
                partner: action.payload.data
            };
        }
        case Types.GET_USER_APPROVE_FULFILLED: {
            const userId = (action.payload.config.url).split('/').pop();
            const partners = state.partnersData.partners;
            const idx = partners.findIndex(item => item.id === userId);
            const updatedRow = partners[idx];
            updatedRow.status = "approved";
            partners.splice(idx, 1, updatedRow);
            return {
                ...state,
                partnersData: {
                    metadata: state.partnersData.metadata,
                    partners: partners
                }

            };
        }
        case Types.POST_PARTNER_FULFILLED: {
            return {
                ...state,
                partnersData: state.partnersData.concat(action.payload.data)
            };
        }
        case Types.UPDATE_PARTNER_FULFILLED: {
            const requests = [...state.partnersData];
            const idx = requests.findIndex(request => request.id === action.payload.data.id);
            requests.splice(idx, 1, action.payload.data);

            return {
                ...state,
                partnersData: requests
            };
        }
        case Types.DELETE_PARTNER_FULFILLED: {
            const requests = [...state.partnersData];
            const idx = requests.findIndex(request => request.id === action.payload.data.id);
            requests.splice(idx, 1);

            return idx === -1 ? { ...state } : { ...state, partnersData: requests };
        }
    }
    return state;
}