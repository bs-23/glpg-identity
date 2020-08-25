import Types from './user.types';

const initialState = {
    loggedInUser: null,
    users: {},
    deletedUserInfo: {},
    roles: [],
    countries: []
};

function sortItems(itms, val, type) {
    return itms.sort(function (a, b) {
        const count = a[val].length < b[val].length ? a[val].length : b[val].length;
        let flag = 0;
        for (let index = 0; index < count; index++) {
            const aVal = a[val][index];
            const bVal = b[val][index];
            if (aVal.toLowerCase() < bVal.toLowerCase()) {
                flag = -1 * type;
                break;
            } else if (aVal.toLowerCase() > bVal.toLowerCase()) {
                flag = 1 * type;
                break;
            } else if (aVal.toLowerCase() === bVal.toLowerCase()) {
                if (aVal < bVal) {
                    flag = -1 * type;
                    break;
                } else if (aVal > bVal) {
                    flag = 1 * type;
                    break;
                }
            }
        }

        return flag;
    });
}

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
                users: (action.payload.type === 'ASC') ? { ...state.users, users: sortItems(state.users['users'], action.payload.val, 1) } :
                    { ...state.users, users: sortItems(state.users['users'], action.payload.val, -1) }
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
