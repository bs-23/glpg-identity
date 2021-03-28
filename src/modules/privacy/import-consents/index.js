import React from 'react';
import ImportConsentsDashboard from './client/import-consents.component';
import ClientRoutes from './client/import-consents.routes';
import consentImportReducer from './client/import-consents.reducer';
import * as importedConsentActions from './client/import-consents.actions';

export function ImportConsentsRoutes(props) {
    return <ClientRoutes path={props.path} />;
}

export {
    ImportConsentsDashboard,
    importedConsentActions,
    consentImportReducer
};
