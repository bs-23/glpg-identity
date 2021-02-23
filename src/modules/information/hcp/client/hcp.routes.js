import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";
import HcpUsers from "./components/hcp-profiles.component";
import CrdlpHcpProfiles from './components/crdlp-hcp-profiles.component';
import SearchProfessionalHcp from "./components/search-professional-hcp.component";
import SearchOrganizationHcp from "./components/search-organization-hcp.component";
import InformationManagement from './components/information-management.component';
import PrivateRoute from "../../../core/client/PrivateRoute";

export default function HcpRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={InformationManagement} module={'information'} />
            <PrivateRoute path={`${path}/list/cdp`} component={HcpUsers} module={'manage-hcp'} />
            <PrivateRoute path={`${path}/list/crdlp`} component={CrdlpHcpProfiles} module={'manage-hcp'} />
            <PrivateRoute path={`${path}/discover-professionals`} component={SearchProfessionalHcp} module={'discover-hcp-hco'} />
            <PrivateRoute path={`${path}/discover-organizations`} component={SearchOrganizationHcp} module={'discover-hcp-hco'} />
        </Switch>
    );
}
