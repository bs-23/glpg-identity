import { combineReducers } from "redux";
import userReducer from "../../user/client/user.reducer";
import hcpReducer from "../../hcp/client/hcp.reducer";
import consentReducer from "../../consent/client/consent.reducer"
import countryReducer from '../../core/client/country/country.reducer';

export default combineReducers({
    userReducer,
    hcpReducer,
    consentReducer,
    countryReducer
})
