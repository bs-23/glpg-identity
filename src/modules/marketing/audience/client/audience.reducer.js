import Types from './audience.types';

const initialState = {
    audiences: {}
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_AUDIENCES_FULFILLED: {
            return {
                ...state,
                audiences: action.payload.data
            };
        }
    }

    return state;
}
