import React from "react";
import { Switch, useRouteMatch, Route } from "react-router-dom";
import PrivateRoute from "../../../core/client/PrivateRoute";
import BusinessPartnerManagement from "../../common/client/components/business-partner-management.component";
import HcpPartnerRequests from "./components/hcp-partner-requests.component";
import HcoPartnerRequests from "./components/hco-partner-requests.component";
import VendorPartnerRequests from "./components/vendor-partner-requests.component";
import WholesalerPartnerRequests from "./components/wholesaler-partner-requests.component";


export default function ManageRequestsRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={BusinessPartnerManagement} />
            <PrivateRoute path={`${path}/requests/hcos`} component={HcoPartnerRequests} />
            <PrivateRoute path={`${path}/requests/hcps`} component={HcpPartnerRequests} />
            <PrivateRoute path={`${path}/requests/vendors`} component={VendorPartnerRequests} />
            <PrivateRoute path={`${path}/requests/wholesalers`} component={WholesalerPartnerRequests} />
        </Switch>
    );
}
