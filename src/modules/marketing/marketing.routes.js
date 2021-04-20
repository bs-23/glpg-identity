import React from 'react';
import { Switch, useRouteMatch } from 'react-router-dom';
import PrivateRoute from '../core/client/PrivateRoute';
import MarketingManagement from './marketing-management.component';
import { Campaigns } from './campaign';
import { Templates } from './templates';
import { Audience } from './audience';

export default function MarketingRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={MarketingManagement} module={'marketing-and-promotional'} />
            <PrivateRoute path={`${path}/mass-mailing`} component={Campaigns} module={'mass-mailing-management'} />
            <PrivateRoute path={`${path}/manage-audience`} component={Audience} module={'audience-management'} />
            <PrivateRoute path={`${path}/manage-templates`} component={Templates} module={'templates-management'} />
        </Switch>
    );
}
