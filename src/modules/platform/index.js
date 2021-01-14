import React from 'react';
import { Route, useRouteMatch } from 'react-router-dom';
import { FaqClientRoutes, faqReducer, Faq, ManageFaq } from './faq';
import { UserClientRoutes, userReducer, userActions, Login, Dashboard, ForgotPassword, ResetPassword, MyProfile } from './user';
import { ProfileClientRoutes, profileReducer, ManageProfiles, profileActions } from './profile';
import { RoleClientRoutes, roleReducer, ManageRoles } from './role';
import { PermissionSetClientRoutes, permissionSetReducer, PermissionSetDetailsModal, ManagePermissionSets } from './permission-set';

export function PlatformRoutes() {
    const { path } = useRouteMatch();

    return (
        <Route>
            <UserClientRoutes path={path} />
            <FaqClientRoutes path={path} />
            <ProfileClientRoutes path={path} />
            <RoleClientRoutes path={path} />
            <PermissionSetClientRoutes path={path} />
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
    MyProfile,
    PermissionSetDetailsModal,
    Faq,
    ManageFaq,
    ManagePermissionSets,
    ManageProfiles,
    ManageRoles,
    profileActions
};
