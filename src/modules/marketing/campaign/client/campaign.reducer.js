import Types from './campaign.types';

const initialState = {
    campaignList: {}
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_CAMPAIGNS_FULFILLED: {
            return {
                ...state,
                campaignList: action.payload.data
            };
        }
    }

    return state;
}
