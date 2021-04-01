import React from 'react';
import ClientRoutes from './client/consent-import-job.routes';
import consentImportJobReducer from './client/consent-import-job.reducer';
import * as ConsentImportJobActions from './client/consent-import-job.actions';
import ConsentImportJobsComponent from './client/consent-import-jobs.component';

export function ConsentImportJobRoutes(props) {
    return <ClientRoutes path={props.path}/>;
}

export {
    ConsentImportJobActions,
    consentImportJobReducer,
    ConsentImportJobsComponent
};
