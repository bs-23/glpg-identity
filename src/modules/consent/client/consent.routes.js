import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";
import DataPrivacyAndConsentManagement from './components/data-privacy-and-consent-management.component';
import ConsentPerformanceFinalReport from './components/consent-performance-final-report.component';
import PrivateRoute from "../../core/client/PrivateRoute";

export default function HcpRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={DataPrivacyAndConsentManagement} module={'privacy'}/>
            <PrivateRoute path={`${path}/consent-performance-report`} component={ConsentPerformanceFinalReport} module={'privacy'}/>
        </Switch>
    );
}