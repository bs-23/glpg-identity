import React from "react";
import { useSelector } from "react-redux";
import { Route, Redirect } from "react-router-dom";
import Navbar from "./components/navbar.component";

export default function PrivateRoute({ component: Component, module, ...rest }) {
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);
    const roles = loggedInUser ? loggedInUser.roles : [];
    let permissions = [];

    roles.forEach(role => {
        const union = (a, b) => [...new Set([...a, ...b])];
        if(role.permissions) permissions = union(permissions, role.permissions);
    })
    // const permissions = loggedInUser ? loggedInUser.permissions : [];

    return (
        <Route {...rest} render={props => {
            return (
                loggedInUser ? (!module || permissions.some( module_permission => module_permission === module)) ? (
                    <>
                        <Navbar/>
                        <Component {...props} />
                    </>
                ) : (
                    props.history.replace({
                        pathname: "/forbidden",
                        state: { from: props.location }
                    })
                ) : (
                    <Redirect push to={{
                        pathname: "/login",
                        state: { from: props.location }
                    }}/>
                )
            )
        }}/>
    );
}
