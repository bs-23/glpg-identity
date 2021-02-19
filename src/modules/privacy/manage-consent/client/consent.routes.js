import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";
import DataPrivacyAndConsentManagement from './data-privacy-and-consent-management.component';
import ConsentsComponent from './consents.component';
import ConsentForm from './consent-form.component';
import PrivateRoute from "../../../core/client/PrivateRoute";

export default function ConsentRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={DataPrivacyAndConsentManagement} module={'privacy'} />
            <PrivateRoute path={`${path}/list`} component={ConsentsComponent} module={'manage-consent'} />
            <PrivateRoute path={`${path}/create`} component={ConsentForm} module={'manage-consent'} />
            <PrivateRoute path={`${path}/edit/:id`} component={ConsentForm} module={'manage-consent'} />
        </Switch>
    );
}
