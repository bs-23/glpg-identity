import { combineReducers } from "redux";

import userReducer from "../../user/client/user.reducer";
import countryReducer from "../../core/client/country.reducer";

export default combineReducers({
    userReducer,
    countryReducer
})
