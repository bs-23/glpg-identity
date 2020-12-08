import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";
import Users from "./components/users.component";
import UserForm from "./components/user-form.component";
import UserManagement from "./components/user-management.component";
import UserDetails from "./components/user-details.component";
import PrivateRoute from "../../../core/client/PrivateRoute";

export default function UserRoutes() {
    const { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={UserManagement} module={'platform'} />
            <PrivateRoute path={`${path}/users/create`} component={UserForm} module={'platform'} />
            <PrivateRoute path={`${path}/users/:id`} component={UserDetails} module={'platform'} />
            <PrivateRoute path={`${path}/users`} component={Users} module={'platform'} />
        </Switch>
    );
}
