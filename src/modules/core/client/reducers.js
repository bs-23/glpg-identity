import { combineReducers } from 'redux';
import hcpReducer from '../../information/hcp/client/hcp.reducer';
import countryReducer from '../../core/client/country/country.reducer';
import { consentReducer, consentCategoryReducer, consentCountryReducer, consentPerformanceReducer } from '../../consent';
import { faqReducer, userReducer, profileReducer, roleReducer, permissionSetReducer } from '../../platform';
import consentCategoryReducer from '../../consent/client/consent-category/category.reducer';
import { manageRequestsReducer } from '../../partner';
import { managePartnerReducer } from '../../partner';

export default combineReducers({
    userReducer,
    hcpReducer,
    faqReducer,
    profileReducer,
    roleReducer,
    permissionSetReducer,
    manageRequestsReducer,
    managePartnerReducer,
    countryReducer,
    consentReducer,
    consentCategoryReducer,
    consentCountryReducer,
    consentPerformanceReducer
})
