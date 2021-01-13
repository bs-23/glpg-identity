import React from 'react';
import { Route, useRouteMatch } from 'react-router-dom';
import { ManagePartnersClientRoutes, manageRequestsReducer, manageRequestsActions } from './manage-requests';

export function PartnerRoutes() {
    const { path } = useRouteMatch();

    return (
        <Route>
            <ManagePartnersClientRoutes path={path}/>
        </Route>
    );
}

export {
    manageRequestsReducer,
    manageRequestsActions
};
