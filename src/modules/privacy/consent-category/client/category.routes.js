import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";

import PrivateRoute from "../../../core/client/PrivateRoute";
import ConsentCategory from "./categories.component";

export default function ConsentCategoryRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute path={`${path}/consent-categories`} component={ConsentCategory} module={'consent-category'} />
        </Switch>
    );
}
