import React from "react";
import { useSelector } from "react-redux";
import { Route, Redirect } from "react-router-dom";
import Navbar from "./components/navbar.component";
import { useCookies } from 'react-cookie';

export default function PrivateRoute({ component: Component, module, ...rest }) {
    const [cookies] = useCookies();
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);
    const profile = loggedInUser ? loggedInUser.profile : null;
    const role = loggedInUser ? loggedInUser.role : null;
    let serviceCategories = [];

    const union = (a, b) => [...new Set([...a, ...b])];
    if (profile) {
        profile.permissionSets.forEach(permissionSet => {


            if (permissionSet.serviceCategories) {
                serviceCategories = union(serviceCategories, permissionSet.serviceCategories );
            }
        });
    }
    if (role && role[0]) {
        role[0].permissionSets.forEach(permissionSet => {


            if (permissionSet.serviceCategories) {
                serviceCategories = union(serviceCategories, permissionSet.serviceCategories );
            }
        });
    }


    // alert(typeof(cookies.logged_in))
    return (
        <Route {...rest} render={props => {
            return (
                loggedInUser ? (!module || serviceCategories.some(module_permission => module_permission === module)) ? (
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
                        }} />
                    )
            )
        }} />
    );
}
