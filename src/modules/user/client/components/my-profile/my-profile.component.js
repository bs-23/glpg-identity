import React from 'react';
import UpdateMyProfile from './update-my-profile.component';
import ChangePasswordForm from './password.component';
import Sidebar from './sidebar.component';

const MyProfile = () => {
    const sideBarItems = [
        {
            label: "My Profile",
            onClick: () => null
        },
        {
            label: "Change Password",
            onClick: () => null
        }
    ];

    return <div className="container">
        <h4>My Profile</h4>
        {/* <Sidebar menuItems={sideBarItems} idExtractor={(item) => item.label}/> */}
        <UpdateMyProfile />
        <ChangePasswordForm />
    </div>
}

export default MyProfile;
