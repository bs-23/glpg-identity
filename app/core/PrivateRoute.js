import React from "react";
import { connect } from "react-redux";
import { Route, Redirect } from "react-router-dom";

const mapStateToProps = (state) => {
    return {
        isAuthenticated: state.userReducer.isLoggedIn
    };
};

class PrivateRoute extends React.Component {
    render() {
        const { component: Component, isAuthenticated, ...rest } = this.props;

        return (
            <Route {...rest} render={props => {
                return (
                    isAuthenticated ? (
                        <>
                            <Component {...props}/>
                        </>
                    ) : (
                        <Redirect push to={{
                            pathname: "/login",
                            state: { from: props.location }
                        }}/>
                    )
                )
            }}/>
        )
    }
}

export default connect(mapStateToProps)(PrivateRoute);
