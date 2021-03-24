import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";

import PrivateRoute from "../../../core/client/PrivateRoute";
import ImportConsentsDashboard from "./import-consents-dashboard.component";

export default function ClientRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute path={`${path}/import-consents`} component={ImportConsentsDashboard} />
        </Switch>
    );
}
