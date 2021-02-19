import React from 'react';
import { Switch, useRouteMatch } from 'react-router-dom';
import PrivateRoute from '../../../core/client/PrivateRoute';
import BusinessPartnerManagement from './components/business-partner-management.component';



export default function ManageRequestsRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={BusinessPartnerManagement} module="business-partner" />
        </Switch>
    );
}
