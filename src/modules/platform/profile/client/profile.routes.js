import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";
import PrivateRoute from "../../../core/client/PrivateRoute";
import ManageProfiles from "./profiles.component";

export default function UserRoutes() {
    const { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute path={`${path}/profiles`} component={ManageProfiles} module={'manage-profile'} />
        </Switch>
    );
}
