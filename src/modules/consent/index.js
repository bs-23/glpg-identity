import React from 'react';
import { Route, useRouteMatch } from 'react-router-dom';

import { ManageConsentRoutes, consentReducer, consentActions, Consent, Consents, ConsentForm, DataPrivacyConsentMaagement } from './manage-consent';
import { ManageConsentCategoryRoutes, categoryReducer, ConsentCategories, categoryActions } from './consent-category';

export function ConsentRoutes() {
    const { path } = useRouteMatch();

    return (
        <Route>
            <ManageConsentRoutes path={path} />
            <ManageConsentCategoryRoutes path={path} />
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
    categoryReducer,
    ConsentCategories,
    categoryActions
};
