import React from "react";
import { connect } from "react-redux";
import { Route, Redirect } from "react-router-dom";

const mapStateToProps = (state) => {
    return {
        isAuthenticated: state.userReducer.isLoggedIn
    };
};

class PublicRoute extends React.Component {
    render() {
        const { component: Component, isAuthenticated, ...rest } = this.props;

        return (
            <Route {...rest} render={props => {
                return (
                    isAuthenticated ? (
                        <Redirect push to={{
                            pathname: props.location.state
                                ? props.location.state.from.pathname
                                : "/",
                            search: props.location.state
                                ? props.location.state.from.search
                                : "",
                            state: { from: props.location }
                        }} />
                    ) : (
                        <div className="components bg-success">
                            <Component {...props}/>
                        </div>
                    )
                )
            }}/>
        )
    }
}

export default connect(mapStateToProps)(PublicRoute);
