import { combineReducers } from "redux";

import userReducer from "../../../user/client/user.reducer";
import countryReducer from "../../client/reducers/country.reducer";

export default combineReducers({
    userReducer,
    countryReducer
})
