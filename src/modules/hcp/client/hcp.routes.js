import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";
import HcpUsers from "./components/hcp-users";
import SearchProfessionalHcp from "./components/search-professional-hcp.component";
import SearchOrganizationHcp from "./components/search-organization-hcp.component";
import InformationManagement from './components/information-management.component';
import PrivateRoute from "../../core/client/PrivateRoute";

export default function HcpRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={InformationManagement} module={'information'} />
            <PrivateRoute path={`${path}/list`} component={HcpUsers} module={'information'} />
            <PrivateRoute path={`${path}/discover-professionals`} component={SearchProfessionalHcp} module={'information'} />
            <PrivateRoute path={`${path}/discover-organizations`} component={SearchOrganizationHcp} module={'information'} />
        </Switch>
    );
}
