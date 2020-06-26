import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch, Route } from "react-router-dom";

import "bootstrap/scss/bootstrap";
import "@fortawesome/fontawesome-free/css/all.css";
import "./app.scss";

import NoMatch from "./NoMatch";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import Login from "../../user/client/components/login.component";
import Dashboard from "../../user/client/components/dashboard.component";
import { getSignedInUserProfile } from "../../user/client/user.actions";
import UserRoutes from "../../user/client/user.routes";
import HcpRoutes from "../../hcp/client/hcp.routes";

export default function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getSignedInUserProfile());
    }, []);

    return (
        <Switch>
            <PublicRoute path="/login" component={Login} />

            <PrivateRoute exact path="/" component={Dashboard} />

            <Route path="/users" component={UserRoutes} />

            <Route path="/hcps" component={HcpRoutes} />

            <Route component={NoMatch} />
        </Switch>
    );
}
