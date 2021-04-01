import React from 'react';
import { Switch, useRouteMatch } from 'react-router-dom';

import PrivateRoute from '../../../core/client/PrivateRoute';
import ConsentImportJobsComponent from './consent-import-jobs.component';

export default function ClientRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute path={`${path}/consent-import-jobs`} component={ConsentImportJobsComponent} />
        </Switch>
    );
}
