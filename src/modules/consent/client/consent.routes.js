import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";
import DataPrivacyAndConsentManagement from './components/data-privacy-and-consent-management.component';
import CdpConsentPerformanceReport from './components/cdp-consent-performance-report.component';
import VeevaConsentPerformanceReport from './components/veeva-consent-performance-report.component';
import PrivateRoute from "../../core/client/PrivateRoute";

export default function HcpRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={DataPrivacyAndConsentManagement} module={'privacy'}/>
            <PrivateRoute path={`${path}/consent-performance-report/cdp`} component={CdpConsentPerformanceReport} module={'privacy'}/>
            <PrivateRoute path={`${path}/consent-performance-report/veeva-crm`} component={VeevaConsentPerformanceReport} module={'privacy'}/>
        </Switch>
    );
}