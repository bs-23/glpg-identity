import React from 'react';
import ImportConsentsDashboard from "./client/import-consents-dashboard.component";
import ClientRoutes from './client/import-consents.routes';
import importedConsentReducer from './client/import-consents.reducer';
import * as importedConsentActions from './client/import-consents.actions';

export function ImportConsentsRoutes(props) {
    return <ClientRoutes path={props.path} />;
}

export {
    ImportConsentsDashboard,
    importedConsentActions,
    importedConsentReducer


};
