import Types from "./user.types";

const initialState = {
    loggedInUser: null,
    isLoggedIn: false
}

export default function reducer(state=initialState, action) {
    switch (action.type) {
        case Types.LOGIN_FULFILLED:
        case Types.GET_PROFILE_FULFILLED: {
            return {
                ...state,
                loggedInUser: action.payload.data,
                isLoggedIn: true
            };
        }
    }
    return state;
}
