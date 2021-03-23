import React from 'react';
import ClientRoutes from './client/application.routes';
import applicationReducer from './client/applications.reducer';
import ManageApplications from './client/manage-applications.component';
import ApplicationLog from './client/components/application-log.component';

export function ApplicationRoutes(props) {
    return <ClientRoutes path={props.path} />;
}

export {
    applicationReducer,
    ManageApplications,
    ApplicationLog
};
