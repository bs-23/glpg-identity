import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";
import Users from "./components/users.component";
import UserForm from "./components/user-form.component";
import UserManagement from "./components/user-management.component";
import UserDetails from "./components/user-details.component";
import PrivateRoute from "../../core/client/PrivateRoute";
import Roles from "./components/roles.component";

export default function UserRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={UserManagement} module={'user'} />
            <PrivateRoute path={`${path}/create`} component={UserForm} module={'user'} />
            <PrivateRoute path={`${path}/roles`} component={Roles} module={'user'} />
            <PrivateRoute path={`${path}/list`} component={Users} module={'user'} />
            <PrivateRoute path={`${path}/:id`} component={UserDetails} module={'user'} />
        </Switch>
    );
}
