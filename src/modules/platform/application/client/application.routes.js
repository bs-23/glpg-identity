import React from 'react';
import ManageApplications from './manage-applications.component';
import PrivateRoute from '../../../core/client/PrivateRoute';

export default function ApplicationRoutes(props) {
    return (
        <PrivateRoute path={`${props.path}/manage-applications`} component={ManageApplications} module={'manage-service-accounts'}/>
    );
}
