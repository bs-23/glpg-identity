import React from "react";
import { connect } from "react-redux";
import { withRouter, Switch, Route } from "react-router-dom";

import "bootstrap/scss/bootstrap";
import "./app.scss";

import NoMatch from "./NoMatch";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import Login from "../../user/client/components/login.component";
import Dashboard from "../../user/client/components/dashboard.component";
import { getSignedInUserProfile } from "../../user/client/user.actions";
import UserRoutes from "../../user/client/user.routes";

class App extends React.Component {
    constructor(props) {
        super();
        props.getSignedInUserProfile();
    }

    render() {
        return (
            <Switch>
                <PublicRoute path="/login" component={Login}/>

                <PrivateRoute exact path="/" component={Dashboard}/>

                <Route path="/users" component={UserRoutes}/>

                <Route component={NoMatch} />
            </Switch>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getSignedInUserProfile: function () {
            dispatch(getSignedInUserProfile());
        }
    };
};

export default withRouter(connect(null, mapDispatchToProps)(App));
