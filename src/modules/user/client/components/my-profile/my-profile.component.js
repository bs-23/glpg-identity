import React from 'react';
import { useSelector } from 'react-redux';
import UpdateMyProfile from './update-my-profile.component';
import ChangePasswordForm from './password.component';
import Sidebar from './sidebar.component';
import { Route, useRouteMatch } from 'react-router-dom';

const MyProfile = () => {
    const myProfileInfo = useSelector(state => state.userReducer.loggedInUser);
    const routeMatch = useRouteMatch();
    const userFullName = `${myProfileInfo.first_name} ${myProfileInfo.last_name}`;

    const sideBarItems = [
        {
            label: "My Profile",
            toUrl: "/users/my-profile"
        },
        {
            label: "Change Password",
            toUrl: "/users/my-profile/change-password"
        }
    ];

    return <div className="container">
        <div className="row m-3">
            <div className="col-3">
                <Sidebar header={userFullName} menuItems={sideBarItems} idExtractor={(item) => item.label}/>
            </div>
            <div className="col-8">
                <Route exact path={routeMatch.url} component={UpdateMyProfile} />
                <Route exact path={`${routeMatch.url}/change-password`} component={ChangePasswordForm} />
            </div>
        </div>
    </div>
}

export default MyProfile;
