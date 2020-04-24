import axios from "axios";
import Types from "./user.types";

export function getLoggedInUserProfile() {
    return {
        type: Types.GET_PROFILE,
        payload: axios({
            method: "get",
            url: "/users/getLoggedInUserProfile"
        })
    };
}

export function login(data) {
    return {
        type: Types.LOGIN,
        payload: axios({
            method: "post",
            url: "/login",
            data: data
        })
    };
}
