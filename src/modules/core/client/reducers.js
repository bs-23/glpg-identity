import { combineReducers } from 'redux';
import hcpReducer from '../../information/hcp/client/hcp.reducer';
import countryReducer from '../../core/client/country/country.reducer';
import { consentReducer, consentCategoryReducer, consentCountryReducer, consentPerformanceReducer } from '../../privacy';
import { faqReducer, userReducer, profileReducer, roleReducer, permissionSetReducer } from '../../platform';
import clinicalTrialsReducer from '../../clinical-trials/client/components/clinical-trials.reducer'

export default combineReducers({
    userReducer,
    hcpReducer,
    faqReducer,
    profileReducer,
    roleReducer,
    permissionSetReducer,
    countryReducer,
    consentReducer,
    consentCategoryReducer,
    consentCountryReducer,
    consentPerformanceReducer,
    clinicalTrialsReducer
})
