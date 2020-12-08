import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";
import PrivateRoute from "../../../core/client/PrivateRoute";
import Roles from "./components/roles.component";

export default function UserRoutes() {
    const { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute path={`${path}/roles`} component={Roles} module={'platform'} />
        </Switch>
    );
}
