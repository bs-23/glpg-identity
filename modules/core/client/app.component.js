import React from "react";
import { connect } from "react-redux";
import { withRouter, Switch, Route } from "react-router-dom";

import NoMatch from "./NoMatch";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import Login from "../../user/client/login.component";
import Dashboard from "../../user/client/dashboard.component";
import { getLoggedInUserProfile } from "../../user/client/user.actions";

import "bootstrap/scss/bootstrap";
import "./app.component.scss";

class App extends React.Component {
    constructor(props) {
        super();
        props.getLoggedInUserProfile();
    }

    render() {
        return (
            <Switch>
                <PublicRoute path="/login" component={Login}/>

                <PrivateRoute exact path="/" component={Dashboard}/>

                <Route component={NoMatch}/>
            </Switch>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getLoggedInUserProfile: function() {
            dispatch(getLoggedInUserProfile());
        }
    };
};

export default withRouter(connect(null, mapDispatchToProps)(App));
