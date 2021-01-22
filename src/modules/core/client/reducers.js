import { combineReducers } from 'redux';
import hcpReducer from '../../information/hcp/client/hcp.reducer';
import countryReducer from '../../core/client/country/country.reducer';
import { consentReducer, categoryReducer, consentCountryReducer } from '../../consent';
import { faqReducer, userReducer, profileReducer, roleReducer, permissionSetReducer } from '../../platform';
import consentCategoryReducer from '../../consent/consent-category/client/category.reducer';

export default combineReducers({
    userReducer,
    hcpReducer,
    countryReducer,
    consentReducer,
    categoryReducer,
    consentCountryReducer,
    consentCategoryReducer,
    faqReducer,
    profileReducer,
    roleReducer,
    permissionSetReducer
})
