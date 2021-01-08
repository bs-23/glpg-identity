import React from "react";
import { Switch, useRouteMatch, Route } from "react-router-dom";
import PrivateRoute from "../../../core/client/PrivateRoute";
import BusinessPartnerManagement from "./components/business-partner-management.component";
import Supplier from "./components/supplier.component";


export default function ManagePartnersRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={BusinessPartnerManagement} />
            <PrivateRoute path={`${path}/requests`} component={Supplier} />
        </Switch>
    );
}
