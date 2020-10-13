import React from "react";
import { useSelector } from "react-redux";
import { useCookies } from 'react-cookie';
import { Route, Redirect } from 'react-router-dom';
import Navbar from './components/navbar.component';

export default function PrivateRoute({ component: Component, module, ...rest }) {
    const [cookies] = useCookies();
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);
    const roles = loggedInUser ? loggedInUser.roles : [];
    let permissions = [];

    
    roles.forEach(role => {
        const union = (a, b) => [...new Set([...a, ...b])];
        if(role.permissions) permissions = union(permissions, role.permissions);
    });
    
    // const obj = {
    //     cookie: cookies.logged_in,
    //     loggedInUser,
    //     local_storage: localStorage.getItem('logged_in'),
    //     Component
    // }
    // console.log('==================> here comes', obj);
    // alert('ok1')

    return (
        <Route {...rest} render={props => {
            return (
                loggedInUser && cookies.logged_in ? (!module || permissions.some( module_permission => module_permission === module)) ? (
                    <>
                        <Navbar/>
                        <Component {...props} />
                    </>
                ) : (
                    props.history.replace({
                        pathname: "/forbidden",
                        state: { from: props.location }
                    })
                ) : localStorage.getItem('logged_in') ? null : ( 
                    <Redirect push to={{
                        pathname: "/login",
                        state: { from: props.location }
                    }}/>
                )
            )
        }}/>
    );
}
