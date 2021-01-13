import React from "react";
import { Switch, useRouteMatch, Route } from "react-router-dom";
import PrivateRoute from "../../../core/client/PrivateRoute";
import BusinessPartnerManagement from "./components/business-partner-management.component";
import HcpBusinessPartnerManagement from "./components/hcp-business-partner-management.component";
import HcoBusinessPartnerManagement from "./components/hco-business-partner-management.component";
import VendorManagement from "./components/vendor-management.component";
import VendorBusinessPartnerManagement from "./components/vendor-business-partner-management.component";
import WholesalerBusinessPartnerManagement from "./components/wholesaler-business-partner-management.component";


export default function ManagePartnersRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={BusinessPartnerManagement} />
            <PrivateRoute path={`${path}/requests/hcos`} component={HcoBusinessPartnerManagement} />
            <PrivateRoute path={`${path}/requests/hcps`} component={HcpBusinessPartnerManagement} />
            <PrivateRoute path={`${path}/requests/vendors`} component={VendorBusinessPartnerManagement} />
            <PrivateRoute path={`${path}/requests/wholesalers`} component={WholesalerBusinessPartnerManagement} />
            <PrivateRoute path={`${path}/vendor-management/vendors`} component={VendorManagement} />
            <PrivateRoute path={`${path}/vendor-management/hcp`} component={VendorManagement} />
            <PrivateRoute path={`${path}/vendor-management/hco`} component={VendorManagement} />
        </Switch>
    );
}
