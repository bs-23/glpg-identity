import Types from './localization.types';

const initialState = {
    localizations: []
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_LOCALIZATIONS_FULFILLED: {
            return {
                ...state,
                localizations: action.payload.data
            };
        }
    }
    return state;
}
