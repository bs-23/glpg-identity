import React from 'react';
import ClientRoutes from './client/consent.routes';
import consentReducer from './client/consent.reducer';
import * as consentActions from './client/consent.actions';

export function ManageConsentRoutes(props) {
    return <ClientRoutes path={props.path} />;
}

export {
    consentReducer,
    consentActions
};
