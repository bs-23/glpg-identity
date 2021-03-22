import Types from './campaign.types';

const initialState = {
    campaigns: []
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_CAMPAIGNS_FULFILLED: {
            return {
                ...state,
                campaigns: action.payload.data
            };
        }
    }

    return state;
}
