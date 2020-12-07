import axios from 'axios';
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch, Route } from "react-router-dom";
import { useCookies } from 'react-cookie';
import { ToastProvider } from 'react-toast-notifications';

import "bootstrap/scss/bootstrap";
import "@fortawesome/fontawesome-free/css/all.css";
import "./app.scss";

import Forbidden from './Forbidden';
import NoMatch from "./NoMatch";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import Login from "../../platform/user/client/components/login.component";
import Dashboard from "../../platform//user/client/components/dashboard.component";
import { getSignedInUserProfile } from "../../platform/user/client/user.actions";
import HcpRoutes from "../../hcp/client/hcp.routes";
import ConsentRoutes from "../../consent/client/consent.routes";
import ForgotPassword from '../../platform/user/client/components/forgot-password.component';
import ResetPasswordForm from '../../platform/user/client/components/reset-password.component';
import MyProfile from '../../platform/user/client/components/my-profile/my-profile.component';
import SwaggerLogin from '../../../config/server/lib/swagger/swagger-login.component';
import store from './store';
import { getCountries } from '../../core/client/country/country.actions';
import { PlatformRoutes } from '../../platform';
import HelpComponent from '../../core/client/components/help.component';

let refCount = 0;

function setLoading(isLoading) {
    if (isLoading) {
        refCount++;
        document.getElementById('loader').style = 'display: block';
    } else if (refCount > 0) {
        refCount--;
        if (refCount > 0) document.getElementById('loader').style = 'display: block';
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

axios.interceptors.response.use(
    response => response,
    error => {
        const { loggedInUser } = store.getState().userReducer;

        if (error.response && error.response.status === 401 && loggedInUser) window.location = "/login";

        return Promise.reject(error);
    }
);

export default function App() {
    const dispatch = useDispatch();
    const [, , removeCookie] = useCookies();

    useEffect(() => {
        dispatch(getSignedInUserProfile()).then(() => {
            dispatch(getCountries());
        }).catch(err => {
            if (err.response && err.response.status === 401) removeCookie('logged_in', { path: '/' });
        });
    }, []);

    return (
        <ToastProvider placement="top-center" autoDismissTimeout={2500} >
            <Switch>
                <PublicRoute path="/swagger" component={SwaggerLogin}/>

                <PublicRoute path="/login" component={Login}/>

                <PrivateRoute exact path="/" component={Dashboard}/>

                <Route path="/hcps" component={HcpRoutes}/>

                <Route path='/consent' component={ConsentRoutes}/>

                <Route path="/reset-password" component={ResetPasswordForm}/>

                <Route path="/forgot-password" component={ForgotPassword}/>

                <Route path="/forbidden" component={Forbidden}/>

                <Route path="/platform" component={PlatformRoutes}/>

                <Route path="/my-profile" component={MyProfile}/>

                <PrivateRoute path="/help" component={HelpComponent}/>

                <Route component={NoMatch} />
            </Switch>
        </ToastProvider>
    );
}
