import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";
import PrivateRoute from "../../../core/client/PrivateRoute";
import ManagePermissionSets from "../../permission-set/client/components/permission-sets.component";

export default function PermissionSetRoutes() {
    const { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute path={`${path}/permission-sets`} component={ManagePermissionSets} module={'platform'} />
        </Switch>
    );
}
