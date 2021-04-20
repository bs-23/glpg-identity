import Types from './templates.types';

const initialState = {
    templates: {}
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_TEMPLATES_FULFILLED: {
            return {
                ...state,
                templates: action.payload.data
            };
        }
    }

    return state;
}
