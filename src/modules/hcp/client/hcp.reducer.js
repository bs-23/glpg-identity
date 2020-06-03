import Types from "./hcp.types";

const initialState = {
    hcpUsers: []
}

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_HCP_USER_LIST_FULFILLED: {
            return {
                ...state,
                hcpUsers: action.payload.data
            };
        }
    }
    return state;
}
