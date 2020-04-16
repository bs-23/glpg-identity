import React from "react";
import { connect } from "react-redux";
import { withRouter, Switch, Route } from "react-router-dom";

import NoMatch from "./NoMatch";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import Login from "../user/components/Login";
import Dashboard from "../user/components/Dashboard";

class App extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        return (
            <>
                <Switch>
                    <PublicRoute path="/login" component={Login}/>

                    <PrivateRoute exact path="/" component={Dashboard}/>

                    <Route component={NoMatch}/>
                </Switch>
            </>
        );
    }
}

export default withRouter(connect(null, null)(App));
