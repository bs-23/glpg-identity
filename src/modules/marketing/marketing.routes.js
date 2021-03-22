import React from 'react';
import { Switch, useRouteMatch } from 'react-router-dom';
import PrivateRoute from '../core/client/PrivateRoute';
import MarketingManagement from './marketing-management.component';

export default function MarketingRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={MarketingManagement} module={'marketing-and-promotional'} />
            {/* <PrivateRoute path={`${path}/list/cdp`} component={HcpUsers} module={'manage-hcp'} /> */}
        </Switch>
    );
}
