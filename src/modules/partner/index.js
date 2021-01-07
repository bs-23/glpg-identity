import React from 'react';
import { Route, useRouteMatch } from 'react-router-dom';
import { ManagePartnersClientRoutes, managePartnersReducer, managePartnersActions } from './manage-partners';

export function PartnerRoutes() {
    const { path } = useRouteMatch();

    return (
        <Route>
            <ManagePartnersClientRoutes path={path} />
        </Route>
    );
}

export {
    managePartnersReducer,
    managePartnersActions,
};
