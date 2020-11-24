import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";
import HcpUsers from "./components/hcp-users";
import MissingUsers from "./components/missing-hcp-users.component";
import InformationManagement from './components/information-management.component';
import PrivateRoute from "../../core/client/PrivateRoute";

export default function HcpRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={InformationManagement} module={'information'} />
            <PrivateRoute path={`${path}/list`} component={HcpUsers} module={'information'} />
            <PrivateRoute path={`${path}/missing-users`} component={MissingUsers} module={'information'} />
        </Switch>
    );
}
