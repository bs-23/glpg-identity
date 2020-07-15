import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";
import HcpUsers from "./components/hcp-users";
import PrivateRoute from "../../core/client/PrivateRoute";

export default function HcpRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={HcpUsers} module={'hcp'} />
        </Switch>
    );
}
