import React from 'react';
import { Route, useRouteMatch } from 'react-router-dom';

import { ManageConsentRoutes, consentReducer, consentActions, Consent, Consents, ConsentForm, DataPrivacyConsentMaagement } from './manage-consent';
import { ManageConsentCategoryRoutes, consentCategoryReducer, ConsentCategories, categoryActions } from './consent-category';
import { consentCountryReducer, ConsentCountryRoutes, CountryConsent } from './consent-country';
import { ConsentImportJobRoutes, ConsentImportJobActions, consentImportJobReducer } from './consent-import';

import { ConsentPerformanceRoutes, consentPerformanceReducer, consentPerformanceActions, CDPConsentPermanceReport, VeevaConsentPermanceReport } from './consent-performance';

export function ConsentRoutes() {
    const { path } = useRouteMatch();

    return (
        <Route>
            <ManageConsentRoutes path={path} />
            <ManageConsentCategoryRoutes path={path} />
            <ConsentCountryRoutes path={path} />
            <ConsentPerformanceRoutes path={path} />
            <ConsentImportJobRoutes path={path} />
        </Route>
    );
}

export {
    consentReducer,
    consentActions,
    Consent,
    Consents,
    ConsentForm,
    DataPrivacyConsentMaagement,
    consentCategoryReducer,
    ConsentCategories,
    categoryActions,
    consentCountryReducer,
    CountryConsent,
    consentPerformanceReducer,
    consentPerformanceActions,
    CDPConsentPermanceReport,
    VeevaConsentPermanceReport,
    ConsentImportJobActions,
    consentImportJobReducer
};
