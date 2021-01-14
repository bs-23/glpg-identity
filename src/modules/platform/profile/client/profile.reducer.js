import types from './profile.types';

const initialState = {
};

export default function reducer(state = initialState, action) {
    switch(action.type) {
        case types.GET_PROFILES_FULFILLED: {
            return {
                ...state,
                profiles: action.payload.data
            }
        }
    }
    return state;
}
