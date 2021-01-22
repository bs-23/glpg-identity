import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";

import PrivateRoute from "../../../core/client/PrivateRoute";
// import ConsentCategory from "./";

export default function ConsentCountryRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            {/* <PrivateRoute path={`${path}/consent-categories`} component={ConsentCategory} module={'privacy'} /> */}
        </Switch>
    );
}
