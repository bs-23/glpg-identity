import axios from "axios";
import Types from "./user.types";

export function getSignedInUserProfile() {
    return {
        type: Types.GET_PROFILE,
        payload: axios({
            method: "get",
            url: "/users/getSignedInUserProfile"
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
