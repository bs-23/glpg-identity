import { combineReducers } from 'redux';
import userReducer from '../../user/client/user.reducer';
import hcpReducer from '../../hcp/client/hcp.reducer';
import consentReducer from '../../consent/client/consent.reducer';
import consentCategoryReducer from '../../consent/client/consent-category/category.reducer';

export default combineReducers({
    userReducer,
    hcpReducer,
    consentReducer,
    consentCategoryReducer
})
