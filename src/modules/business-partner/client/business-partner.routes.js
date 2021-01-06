import React from "react";
import { Switch, useRouteMatch, Route } from "react-router-dom";
import PrivateRoute from "../../core/client/PrivateRoute";
import BusinessPartnerManagement from "./components/business-partner-management.component";


export default function BusinessPartnerRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={BusinessPartnerManagement} />
        </Switch>
    );
}
