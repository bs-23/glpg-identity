import React from 'react';
import ImportConsentsDashboard from "./client/import-consents-dashboard.component";
import ClientRoutes from './client/import-consents.routes';

export function ImportConsentsRoutes(props) {
    return <ClientRoutes path={props.path} />;
}

export {
    ImportConsentsDashboard,

};
