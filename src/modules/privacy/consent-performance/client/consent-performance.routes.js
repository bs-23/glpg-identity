import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";

import PrivateRoute from "../../../core/client/PrivateRoute";
import CDPConsentPerformanceReport from './cdp-consent-performance-report.component';
import VeevaConsentPerformanceReport from './veeva-consent-performance-report.component';

export default function ConsentRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute path={`${path}/consent-performance-report/cdp`} component={CDPConsentPerformanceReport} module={'consent-performance'} />
            <PrivateRoute path={`${path}/consent-performance-report/veeva-crm`} component={VeevaConsentPerformanceReport} module={'consent-performance'} />
        </Switch>
    );
}
