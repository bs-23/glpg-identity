import React from "react";
import { useSelector } from "react-redux";
import { useCookies } from 'react-cookie';
import { Route, Redirect } from 'react-router-dom';
import Navbar from './components/navbar.component';

export default function PrivateRoute({ component: Component, module, ...rest }) {
    const [cookies] = useCookies();
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);

    let serviceCategories = loggedInUser && loggedInUser.serviceCategories
        ? loggedInUser.serviceCategories.map(sc => sc.slug)
        : [];

    return (
        <Route {...rest} render={props => {
            return (
                loggedInUser && cookies.logged_in ? (!module || serviceCategories.some( module_permission => module_permission === module)) ? (
                    <>
                        <Navbar />
                        <Component {...props} />
                    </>
                ) : (
                    props.history.replace({
                        pathname: "/forbidden",
                        state: { from: props.location }
                    })
                ) : cookies.logged_in ? null : (
                    <Redirect push to={{
                        pathname: "/login",
                        state: { from: props.location }
                    }}/>
                )
            )
        }} />
    );
}
