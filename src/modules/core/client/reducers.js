import { combineReducers } from 'redux';
import { countryReducer, localizationReducer, phoneExtensionReducer, statisticsReducer } from '../../core';
import hcpReducer from '../../information/hcp/client/hcp.reducer';
import { consentReducer, consentCategoryReducer, consentCountryReducer, consentPerformanceReducer } from '../../privacy';
import { faqReducer, userReducer, profileReducer, roleReducer, permissionSetReducer } from '../../platform';
import { manageRequestsReducer, managePartnerReducer } from '../../partner';
import { applicationReducer } from '../../platform';
import localizationsReducer from '../../core/client/localization/localization.reducer';
import clinicalTrialsReducer from '../../clinical-trials/client/components/clinical-trials.reducer';
import campaignReducer from '../../marketing/campaign/client/campaign.reducer';

export default combineReducers({
    countryReducer,
    localizationReducer,
    phoneExtensionReducer,
    statisticsReducer,
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
    clinicalTrialsReducer,
    localizationsReducer,
    applicationReducer,
    campaignReducer
})
