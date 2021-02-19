import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";
import ClinicalTrials from './components/clinical-trials.component';
import trials from './components/trials';
import PrivateRoute from "../../core/client/PrivateRoute";

export default function HcpRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={ClinicalTrials} module={'clinical-trials'} />
            <PrivateRoute exact path={`${path}/trial`} component={trials} module={'manage-clinical-trials'} />
        </Switch>
    );
}
