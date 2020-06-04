import { combineReducers } from "redux";
import userReducer from "../../../user/client/user.reducer";
import countryReducer from "./country.reducer";
import hcpReducer from "../../../hcp/client/hcp.reducer";

export default combineReducers({
    userReducer,
    countryReducer,
    hcpReducer
})
