import { combineReducers } from "redux";
import userReducer from "../../../user/client/user.reducer";
import countryReducer from "./country.reducer";


export default combineReducers({
    userReducer,
    countryReducer
})
