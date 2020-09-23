import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";
import DataPrivacyAndConsentManagement from './components/data-privacy-and-consent-management.component';
import CdpConsentPerformanceReport from './components/consent-performance-report.component';
import VeevaConsentPerformanceReport from './components/veeva-consent-performance-report.component';
import PrivateRoute from "../../core/client/PrivateRoute";

export default function HcpRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={DataPrivacyAndConsentManagement} module={'privacy'}/>
            <PrivateRoute path={`${path}/cdp-consent-performance-report`} component={CdpConsentPerformanceReport} module={'privacy'}/>
            <PrivateRoute path={`${path}/veeva-consent-performance-report`} component={VeevaConsentPerformanceReport} module={'privacy'}/>
        </Switch>
    );
}