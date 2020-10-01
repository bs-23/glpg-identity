import React from 'react';
import UpdateMyProfile from './update-my-profile.component';
import ChangePasswordForm from './password.component';

const MyProfile = () => {
    return <div className="container">
        <h4>My Profile</h4>
        <UpdateMyProfile />
        <ChangePasswordForm />
    </div>
}

export default MyProfile;
