import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";

import PrivateRoute from "../../../core/client/PrivateRoute";
import CountryConsent from "./country-consents.component";

export default function ConsentCountryRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute path={`${path}/manage-consents-per-country`} component={CountryConsent} module={'privacy'} />
        </Switch>
    );
}
