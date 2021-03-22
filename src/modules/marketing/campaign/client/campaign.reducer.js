import Types from './campaign.types';

const initialState = {
    campaigns: []
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_CAMPAIGNS: {
            return {
                ...state,
                hcps: action.payload.data.data
            };
        }
    }

    return state;
}
