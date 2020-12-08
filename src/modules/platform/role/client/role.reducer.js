import Types from './role.types';

const initialState = {
    roles: []
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_ROLES_FULFILLED: {
            return {
                ...state,
                roles: action.payload.data
            };
        }
        case Types.CREATE_ROLE_FULFILLED: {
            return {
                ...state,
                roles: state.roles.concat(action.payload.data)
            };
        }
    }
    return state;
}
