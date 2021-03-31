import Types from './applications.types';
const initialState = {
    applications: []
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_APPLICATIONS_FULFILLED: {
            return { ...state, applications: action.payload.data };
        }
    }

    return state;
}
