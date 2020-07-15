import Types from "./hcp.types";

const initialState = {
    hcps: {}
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_HCPS_FULFILLED: {
            return {
                ...state,
                hcps: action.payload.data.data
            };
        }

        case Types.SORT_HCPS: {
            return {
                ...state,
                hcps: (action.payload.type === 'ASC') ? { ...state.hcps, users: state.hcps['users'].sort((a, b) => (a[action.payload.val] > b[action.payload.val]) ? 1 : -1) } :
                    { ...state.hcps, users: state.hcps['users'].sort((a, b) => (a[action.payload.val] < b[action.payload.val]) ? 1 : -1) }
            }
        }

        case Types.EDIT_HCPS_FULFILLED: {
            return {
                ...state,
                hcps: {
                    ...state.hcps,
                    users: (state['hcps'].users).map(item => {
                        if (item.id === action.payload.data.id) {
                            return action.payload.data
                        }
                        return item
                    })
                }

            };
        }
    }
    return state;
}
