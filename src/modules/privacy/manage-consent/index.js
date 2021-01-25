import React from 'react';
import ClientRoutes from './client/consent.routes';
import consentReducer from './client/consent.reducer';
import * as consentActions from './client/consent.actions';
import Consent from './client/consent.component';
import ConsentForm from './client/consent-form.component';
import Consents from './client/consents.component';
import DataPrivacyConsentMaagement from './client/data-privacy-and-consent-management.component';

export function ManageConsentRoutes(props) {
    return <ClientRoutes path={props.path} />;
}

export {
    consentReducer,
    consentActions,
    Consent,
    Consents,
    ConsentForm,
    DataPrivacyConsentMaagement
};
