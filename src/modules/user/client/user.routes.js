import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";
import Users from "./components/users.component";
import UserForm from "./components/user-form.component";
import UserManagement from "./components/user-management.component";
import UserDetails from "./components/user-details.component";
import PrivateRoute from "../../core/client/PrivateRoute";

export default function UserRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={UserManagement} />
            <PrivateRoute path={`${path}/create`} component={UserForm} />
            <PrivateRoute path={`${path}/list`} component={Users} />
            <PrivateRoute path={`${path}/:id`} component={UserDetails}/>
        </Switch>
    );
}
