import { combineReducers } from 'redux';
import hcpReducer from '../../hcp/client/hcp.reducer';
import countryReducer from '../../core/client/country/country.reducer';
import consentReducer from '../../consent/client/consent.reducer';
import { faqReducer, userReducer, profileReducer, roleReducer, permissionSetReducer } from '../../platform';
import consentCategoryReducer from '../../consent/client/consent-category/category.reducer';

export default combineReducers({
    userReducer,
    hcpReducer,
    countryReducer,
    consentReducer,
    consentCategoryReducer,
    faqReducer,
    profileReducer,
    roleReducer,
    permissionSetReducer
})
