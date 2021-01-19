import React from 'react';
import { useSelector } from 'react-redux';
import UpdateMyProfile from './update-my-profile.component';
import ChangePasswordForm from './password.component';
import Sidebar from './sidebar.component';
import { Route, useRouteMatch } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';

const MyProfile = () => {
    const myProfileInfo = useSelector(state => state.userReducer.loggedInUser);
    const routeMatch = useRouteMatch();
    const userFullName = myProfileInfo
        ? `${myProfileInfo.first_name} ${myProfileInfo.last_name}`
        : '';

    const sideBarItems = [
        {
            label: "My Profile",
            toUrl: "/my-profile",
            iconClass: "far fa-user mr-2"
        },
        {
            label: "Change Password",
            toUrl: "/my-profile/change-password",
            iconClass: "fas fa-lock mr-2"
        }
    ];

    return <div className="app__content cdp-light-bg">
        <div className="my-profile w-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav className="breadcrumb justify-content-between align-items-center" aria-label="breadcrumb">
                            <ol className="rounded-0 m-0 p-0 d-none d-sm-flex">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item active"><span>My Profile</span></li>
                            </ol>
                            <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                    <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                    <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> My Profile</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </nav>
                    </div>
                </div>
            </div>
            <div className="container">
                <div className="row py-3">
                    <div className="col-12 col-sm-4 position-relative">
                        <Sidebar header={userFullName} menuItems={sideBarItems} idExtractor={(item) => item.label} />
                    </div>
                    <div className="col-12 col-sm-8">
                        <Route exact path={routeMatch.url} component={UpdateMyProfile} />
                        <Route exact path={`${routeMatch.url}/change-password`} component={ChangePasswordForm} />
                    </div>
                </div>
            </div>
        </div>
        </div>
}

export default MyProfile;
