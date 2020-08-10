import Types from './user.types';

const initialState = {
    loggedInUser: null,
    users: {},
    deletedUserInfo: {},
    roles: [],
    countries: []
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.LOGIN_FULFILLED:
        case Types.GET_PROFILE_FULFILLED: {
            return {
                ...state,
                loggedInUser: action.payload.data
            };
        }
        case Types.GET_USERS_FULFILLED: {
            return {
                ...state,
                users: action.payload.data
            };
        } case Types.GET_ROLES_FULFILLED: {
            return {
                ...state,
                roles: action.payload.data
            };
        }
        case Types.GET_USERS_REJECTED: {
            return {
                ...state,
                hasError: true
            };
        }
        case Types.SORT_USERS: {
            return {
                ...state,
                users: (action.payload.type === 'ASC') ? { ...state.users, users: state.users['users'].sort((a, b) => (a[action.payload.val] > b[action.payload.val]) ? 1 : -1) } :
                    { ...state.users, users: state.users['users'].sort((a, b) => (a[action.payload.val] < b[action.payload.val]) ? 1 : -1) }
            }
        }
        case Types.DELETE_USER_FULFILLED: {
            return {
                ...state,
                deletedUserInfo: action.payload.data
            }
        }
        case Types.CREATE_ROLE_FULFILLED: {
            return {
                ...state,
                roles: state.roles.concat(action.payload.data)
            };
        }
        case Types.GET_COUNTRIES_FULFILLED: {
            return {
                ...state,
                countries: action.payload.data
            }
        }
    }
    return state;
}
