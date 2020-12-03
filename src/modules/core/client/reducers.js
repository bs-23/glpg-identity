import { combineReducers } from 'redux';
import userReducer from '../../user/client/user.reducer';
import hcpReducer from '../../hcp/client/hcp.reducer';
import countryReducer from '../../core/client/country/country.reducer';
import consentReducer from '../../consent/client/consent.reducer';
import { faqReducer } from '../../platform';
import consentCategoryReducer from '../../consent/client/consent-category/category.reducer';

export default combineReducers({
    userReducer,
    hcpReducer,
    countryReducer,
    consentReducer,
    consentCategoryReducer,
    faqReducer
})
