import axios from 'axios';
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch, Route } from "react-router-dom";
import { useCookies } from 'react-cookie';

import "bootstrap/scss/bootstrap";
import "@fortawesome/fontawesome-free/css/all.css";
import "./app.scss";

import Forbidden from './Forbidden';
import NoMatch from "./NoMatch";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import Login from "../../user/client/components/login.component";
import Dashboard from "../../user/client/components/dashboard.component";
import { getSignedInUserProfile } from "../../user/client/user.actions";
import UserRoutes from "../../user/client/user.routes";
import HcpRoutes from "../../hcp/client/hcp.routes";
import ForgotPassword from '../../user/client/components/forgot-password.component';
import ResetPasswordForm from '../../user/client/components/reset-password.component';
import { ToastProvider} from 'react-toast-notifications';

let refCount = 0;

function setLoading(isLoading) {
    if (isLoading) {
        refCount++;
        document.getElementById('loader').style = 'display: block';
    } else if (refCount > 0) {
        refCount--;
        if(refCount > 0) document.getElementById('loader').style = 'display: block';
        else document.getElementById('loader').style = 'display: none';
    }
}

axios.interceptors.request.use(config => {
    setLoading(true);
    return config;
}, error => {
    setLoading(false);
    return Promise.reject(error);
});

axios.interceptors.response.use(response => {
    setLoading(false);
    return response;
}, error => {
    setLoading(false);
    return Promise.reject(error);
});

export default function App() {
    const dispatch = useDispatch();
    const [, , removeCookie] = useCookies();

    useEffect(() => {
        dispatch(getSignedInUserProfile()).catch(err => {
            if(err.response.status === 401) removeCookie('logged_in');
        });
    }, []);

    return (
        <ToastProvider placement="top-center" autoDismissTimeout={2500} >
            <Switch>

                <PublicRoute path="/login" component={Login} />

                <PrivateRoute exact path="/" component={Dashboard} />

                <Route path="/users" component={UserRoutes} />

                <Route path="/hcps" component={HcpRoutes} />

                <Route path="/reset-password" component={ResetPasswordForm} />

                <Route path="/forgot-password" component={ForgotPassword} />

                <Route path="/forbidden" component={Forbidden} />

                <Route component={NoMatch} />

            </Switch>
        </ToastProvider>
    );
}
