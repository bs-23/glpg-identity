import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";
import DataPrivacyAndConsentManagement from './components/data-privacy-and-consent-management.component';
import ConsentsList from './components/consents-list.component';
import PrivateRoute from "../../core/client/PrivateRoute";

export default function HcpRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={DataPrivacyAndConsentManagement} module={'privacy'}/>
            <PrivateRoute path={`${path}/consent-performance-report`} component={ConsentsList} module={'privacy'}/>
        </Switch>
    );
}