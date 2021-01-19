import React from 'react';
import { Route, useRouteMatch } from 'react-router-dom';
import { BusinessPartnerManagementClientRoutes } from './common';
import { ManageRequestsClientRoutes, manageRequestsReducer, manageRequestsActions } from './manage-requests';
import { ManagePartnersClientRoutes, managePartnerReducer, managePartnerActions } from './manage-partners'


export function PartnerRoutes() {
    const { path } = useRouteMatch();

    return (
        <Route>
            <BusinessPartnerManagementClientRoutes path={path} />
            <ManageRequestsClientRoutes path={path} />
            <ManagePartnersClientRoutes path={path} />
        </Route>
    );
}

export {
    manageRequestsReducer,
    manageRequestsActions,
    managePartnerReducer,
    managePartnerActions
};
