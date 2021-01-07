import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";
import Trials from './components/trials';
import PrivateRoute from "../../core/client/PrivateRoute";

export default function HcpRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={Trials} module={'clinical-trials'} />
        </Switch>
    );
}
