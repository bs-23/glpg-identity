import React from "react";
import { useSelector } from "react-redux";
import { Route, Redirect } from "react-router-dom";
import Navbar from "./components/navbar.component";
import { useToasts } from 'react-toast-notifications';

export default function PrivateRoute({ component: Component, module, ...rest }) {
    const { addToast } = useToasts();

    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);
    let permissions = [];
    if(loggedInUser) permissions = loggedInUser.permissions

    return (
        <Route {...rest} render={ props => {
            
            return (
                loggedInUser ? (!module || permissions.some( module_name => module_name === module)) ? (
                    <> 
                        <Navbar/>
                        <Component {...props} />
                    </>  
                ) : null : (
                    <Redirect push to={{
                        pathname: "/login",
                        state: { from: props.location }
                    }}/>
                )
            )
        }}/>
    );
}
