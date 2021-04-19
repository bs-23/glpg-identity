import React  from 'react';
import ClientRoutes from './client/user.routes';
import userReducer from './client/user.reducer';
import Login from './client/components/login.component';
import Dashboard from './client/components/dashboard.component';
import ForgotPassword from './client/components/forgot-password.component';
import ResetPassword from './client/components/reset-password.component';
import MyProfile from './client/components/my-profile/my-profile.component';
import UserForm from './client/components/user-form.component';
import * as userActions from './client/user.actions';

export function UserClientRoutes(props) {
    return <ClientRoutes path={props.path} />;
}

export {
    userReducer,
    userActions,
    Login,
    Dashboard,
    ForgotPassword,
    ResetPassword,
    MyProfile,
    UserForm
};
