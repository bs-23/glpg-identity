import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";
import Users from "./components/users.component";
import UserForm from "./components/user-form.component";
import UserManagement from "./components/user-management.component";
import UserDetails from "./components/user-details.component";
import PrivateRoute from "../../core/client/PrivateRoute";
import Roles from "./components/roles.component";
import ManageProfiles from "./components/profiles.component";
import ManagePermissionSets from "./components/permission-sets.component";
import MyProfile from "./components/my-profile/my-profile.component";

export default function UserRoutes() {
    const { path } = useRouteMatch();

    return (
        <Switch>
            <PrivateRoute exact path={path} component={UserManagement} module={'platform'} />
            <PrivateRoute path={`${path}/permission-sets`} component={ManagePermissionSets} module={'platform'} />
            <PrivateRoute path={`${path}/profiles`} component={ManageProfiles} module={'platform'} />
            <PrivateRoute path={`${path}/my-profile`} component={MyProfile} />
            <PrivateRoute path={`${path}/create`} component={UserForm} module={'platform'} />
            <PrivateRoute path={`${path}/roles`} component={Roles} module={'platform'} />
            <PrivateRoute path={`${path}/list`} component={Users} module={'platform'} />
            <PrivateRoute path={`${path}/:id`} component={UserDetails} module={'platform'} />
        </Switch>
    );
}
