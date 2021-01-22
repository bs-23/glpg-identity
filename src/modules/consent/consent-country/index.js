import React from 'react';
import ClientRoutes from './client/consent-country.routes';
import CountryConsent from './client/country-consents.component';
import CountryConsentForm from './client/country-consent-form';
import consentCountryReducer from './client/consent-country.reducer';

export function ManageConsentCategoryRoutes(props) {
    return <ClientRoutes path={props.path} />;
}

export {
    consentCountryReducer,
    CountryConsent,
    CountryConsentForm
};
