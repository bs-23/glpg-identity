import { combineReducers } from 'redux';
import { countryReducer, localizationReducer, phoneExtensionReducer } from '../../core';
import hcpReducer from '../../information/hcp/client/hcp.reducer';
import { consentReducer, consentCategoryReducer, consentCountryReducer, consentPerformanceReducer } from '../../privacy';
import { faqReducer, userReducer, profileReducer, roleReducer, permissionSetReducer } from '../../platform';
import { manageRequestsReducer, managePartnerReducer } from '../../partner';
import clinicalTrialsReducer from '../../clinical-trials/client/components/clinical-trials.reducer'

export default combineReducers({
    countryReducer,
    localizationReducer,
    phoneExtensionReducer,
    userReducer,
    hcpReducer,
    faqReducer,
    profileReducer,
    roleReducer,
    permissionSetReducer,
    manageRequestsReducer,
    managePartnerReducer,
    consentReducer,
    consentCategoryReducer,
    consentCountryReducer,
    consentPerformanceReducer,
    clinicalTrialsReducer
})
