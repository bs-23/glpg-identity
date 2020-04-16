import axios from "axios";
import Types from "./user.types";

export function getUserProfile() {
    return {
        type: Types.GET_PROFILE,
        payload: axios({
            method: "get",
            url: "/api/profile"
        })
    };
}

export function login(data) {
    return {
        type: Types.LOGIN,
        payload: axios({
            method: "post",
            url: "/api/login",
            data: data
        })
    };
}
