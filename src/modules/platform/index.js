import React from 'react';
import { Route, useRouteMatch } from 'react-router-dom';
import { FaqClientRoutes, faqReducer } from './faq';
import { UserClientRoutes, userReducer, userActions, Login, Dashboard, ForgotPassword, ResetPassword, MyProfile } from './user';
import { ProfileClientRoutes, profileReducer } from './profile';
import { RoleClientRoutes, roleReducer } from './role';
import { PermissionSetClientRoutes, permissionSetReducer } from './permission-set';

export function PlatformRoutes() {
    const { path } = useRouteMatch();

    return (
        <Route>
            <UserClientRoutes path={path}/>
            <FaqClientRoutes path={path}/>
            <ProfileClientRoutes path={path}/>
            <RoleClientRoutes path={path}/>
            <PermissionSetClientRoutes path={path}/>
        </Route>
    );
}

export {
    faqReducer,
    userReducer,
    profileReducer,
    roleReducer,
    permissionSetReducer,
    userActions,
    Login,
    Dashboard,
    ForgotPassword,
    ResetPassword,
    MyProfile
};
