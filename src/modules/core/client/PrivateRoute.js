import React from "react";
import { useSelector } from "react-redux";
import { Route, Redirect } from "react-router-dom";
import Navbar from "./components/navbar.component";
import Forbidden from './Forbidden'


export default function PrivateRoute({ component: Component, module, ...rest }) {
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);
    const permissions = loggedInUser ? loggedInUser.permissions : []

    return (
        <Route {...rest} render={props => {
            return (
                loggedInUser ? (!module || permissions.some( module_permission => module_permission === module)) ? (
                    <> 
                        <Navbar/>
                        <Component {...props} />
                    </>  
                ) : <Forbidden {...props} /> : (
                    <Redirect push to={{
                        pathname: "/login",
                        state: { from: props.location }
                    }}/>
                )
            )
        }}/>
    );
}
