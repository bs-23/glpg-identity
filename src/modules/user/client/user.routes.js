import React from "react";
import { Switch, useRouteMatch, Route } from "react-router-dom";
import Users from "./components/users.component";
import UserForm from "./components/user-form.component";
import UserManagement from "./components/user-management.component";
import UserDetails from "./components/user-details.component";
import PrivateRoute from "../../core/client/PrivateRoute";
import Roles from "./components/roles.component";
import MyProfile from "./components/my-profile/my-profile.component";

export default function UserRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={UserManagement} module={'platform'} />
            <PrivateRoute path={`${path}/my-profile`} component={MyProfile} />
            <PrivateRoute path={`${path}/create`} component={UserForm} module={'platform'} />
            <PrivateRoute path={`${path}/roles`} component={Roles} module={'platform'} />
            <PrivateRoute path={`${path}/list`} component={Users} module={'platform'} />
            <PrivateRoute path={`${path}/:id`} component={UserDetails} module={'platform'} />
        </Switch>
    );
}
