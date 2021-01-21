import React from 'react';
import { Route, useRouteMatch } from 'react-router-dom';

import { ManageConsentRoutes } from './manage-consent';

export function ConsentRoutes() {
    const { path } = useRouteMatch();

    return (
        <Route>
            <ManageConsentRoutes path={path} />
        </Route>
    );
}

export {
    // Enter reducer and components here
};
