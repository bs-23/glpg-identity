import React from "react";
import { connect } from "react-redux";
import { withRouter, Switch, Route } from "react-router-dom";

import NoMatch from "./NoMatch";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import Login from "../../user/client/components/login.component";
import Dashboard from "../../user/client/components/dashboard.component";
import { getSignedInUserProfile } from "../../user/client/user.actions";
import UserForm from "../../user/client/components/user-form.component";

import "../../content/scss/main.scss";

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

                <PrivateRoute exact path="/users/create" component={UserForm}/>

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
