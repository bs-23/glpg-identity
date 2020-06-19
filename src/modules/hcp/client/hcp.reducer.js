import Types from "./hcp.types";

const initialState = {
    hcps: []
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_HCPS_FULFILLED: {
            return {
                ...state,
                hcps: action.payload.data
            };
        }
    }
    return state;
}
