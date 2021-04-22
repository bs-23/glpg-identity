import React from "react";
import { Switch, useRouteMatch, Route } from "react-router-dom";
import PrivateRoute from "../../../core/client/PrivateRoute";
import PartnerManagement from "./components/partner-management.component";


export default function ManagePartnersRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute path={`${path}/partner-management/vendors`} module="manage-business-partners" component={PartnerManagement} />
            <PrivateRoute path={`${path}/partner-management/wholesalers`} module="manage-business-partners" component={PartnerManagement} />
            <PrivateRoute path={`${path}/partner-management/hcps`} module="manage-business-partners" component={PartnerManagement} />
            <PrivateRoute path={`${path}/partner-management/hcos`} module="manage-business-partners" component={PartnerManagement} />
        </Switch>
    );
}
