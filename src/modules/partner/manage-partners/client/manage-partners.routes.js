import React from "react";
import { Switch, useRouteMatch, Route } from "react-router-dom";
import PrivateRoute from "../../../core/client/PrivateRoute";
import VendorManagement from "./components/vendor-management.component";


export default function ManagePartnersRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute path={`${path}/partner-management/vendors`} component={VendorManagement} />
            <PrivateRoute path={`${path}/partner-management/wholesalers`} component={VendorManagement} />
            <PrivateRoute path={`${path}/partner-management/hcp`} component={VendorManagement} />
            <PrivateRoute path={`${path}/partner-management/hco`} component={VendorManagement} />
        </Switch>
    );
}
