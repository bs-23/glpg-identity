import React from 'react';
import { Route, useRouteMatch } from 'react-router-dom';
import { campaignReducer } from './campaign';
import MarketingClientRoutes from './marketing.routes';
import MarketingManagement from './marketing-management.component';

export function MarketingRoutes() {
    const { path } = useRouteMatch();

    return (
        <Route>
            <MarketingClientRoutes path={path} />
        </Route>
    );
}

export {
    campaignReducer,
    MarketingManagement
};
