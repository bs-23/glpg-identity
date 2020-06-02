import Types from "./user.types";

const initialState = {
    loggedInUser: null,
    siteAdmins: null
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
        case Types.GET_SITE_ADMIN_LIST_FULFILLED: {
            return { 
                ...state, 
                siteAdmins: action.payload.data 
            };
        }
    }
    return state;
}
