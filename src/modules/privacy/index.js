import React from 'react';
import { Route, useRouteMatch } from 'react-router-dom';

import { ManageConsentRoutes, consentReducer, consentActions, Consent, Consents, ConsentForm, DataPrivacyConsentMaagement } from './manage-consent';
import { ManageConsentCategoryRoutes, consentCategoryReducer, ConsentCategories, categoryActions } from './consent-category';
import { consentCountryReducer, ConsentCountryRoutes } from './consent-country';
import { ConsentPerformanceRoutes, consentPerformanceReducer, consentPerformanceActions, CDPConsentPermanceReport, VeevaConsentPermanceReport } from './consent-performance';

export function ConsentRoutes() {
    const { path } = useRouteMatch();

    return (
        <Route>
            <ManageConsentRoutes path={path} />
            <ManageConsentCategoryRoutes path={path} />
            <ConsentCountryRoutes path={path} />
            <ConsentPerformanceRoutes path={path} />
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
    consentPerformanceReducer,
    consentPerformanceActions,
    CDPConsentPermanceReport,
    VeevaConsentPermanceReport
};
