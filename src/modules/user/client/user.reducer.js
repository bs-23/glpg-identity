import Types from "./user.types";

const initialState = {
    loggedInUser: null,
    siteAdmins: []
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
        case Types.CHANGE_SITE_ADMIN_ACCOUNT_STATUS_FULFILLED: {
            return {
                ...state,
                siteAdmins: state.siteAdmins.map(u => {
                    if(u.id === action.payload.data.id){
                        return {
                                ...u,
                                is_active: action.payload.data.is_active
                        }
                        
                    }
                    else return u
                })
            }
        }
        case Types.DELETE_SITE_ADMIN_ACCOUNT_FULFILLED: {
            return {
                ...state,
                siteAdmins: state.siteAdmins.filter(u => u.id !== action.payload.data.id)
            }
        }
    }
    return state;
}
