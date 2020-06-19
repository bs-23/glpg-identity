import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";
import Users from "./components/users.component";
import UserForm from "./components/user-form.component";
import PrivateRoute from "../../core/client/PrivateRoute";

export default function UserRoutes() {
    let { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={Users}/>
            <PrivateRoute path={`${path}/create`} component={UserForm}/>
        </Switch>
    );
}