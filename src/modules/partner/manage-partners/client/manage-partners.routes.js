import React from "react";
import { Switch, useRouteMatch, Route } from "react-router-dom";
import PrivateRoute from "../../../core/client/PrivateRoute";
import PartnerManagement from "./components/partner-management.component";


export default function ManagePartnersRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute path={`${path}/partner-management/vendor`} component={PartnerManagement} />
            <PrivateRoute path={`${path}/partner-management/wholesaler`} component={PartnerManagement} />
            <PrivateRoute path={`${path}/partner-management/hcp`} component={PartnerManagement} />
            <PrivateRoute path={`${path}/partner-management/hco`} component={PartnerManagement} />
        </Switch>
    );
}
