import React from "react";
import { useCookies } from 'react-cookie';
import { useSelector } from "react-redux";
import { StaticRouter as Router, Route, Redirect } from "react-router-dom";

export default function PublicRoute({ component: Component, ...rest }) {
    const [cookies] = useCookies();

    if (window.location.pathname === '/swagger/login') {
        if (cookies.logged_in_swagger === 'true') {
            window.location.href = '/api-docs';
            return;
        } else {
            return (
                <Route {...rest} render={props => {
                    return (
                        (
                            <Component {...props}/>
                        )
                    )
                }}/>
            )
        }
    }

    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);

    return (
        <Route {...rest} render={props => {
            return (
                loggedInUser ? (
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
                    <Component {...props}/>
                )
            )
        }}/>
    )
}
