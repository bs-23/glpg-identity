import Types from './statistics.types';

const initialState = {
    statistics: {}
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_STATISTICS_FULFILLED: {
            return {
                ...state,
                statistics: action.payload.data
            };
        }
    }

    return state;
}