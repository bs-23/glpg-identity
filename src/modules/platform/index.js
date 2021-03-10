import React from 'react';
import { Route, useRouteMatch } from 'react-router-dom';
import { ApplicationRoutes, applicationReducer } from './application';
import { FaqClientRoutes, faqReducer, Faq, ManageFaq } from './faq';
import { UserClientRoutes, userReducer, userActions, Login, Dashboard, ForgotPassword, ResetPassword, MyProfile, UserForm } from './user';
import { ProfileClientRoutes, profileReducer, ManageProfiles, profileActions } from './profile';
import { RoleClientRoutes, roleReducer, ManageRoles } from './role';
import { PermissionSetClientRoutes, permissionSetReducer, PermissionSetDetailsModal, ManagePermissionSets } from './permission-set';

export function PlatformRoutes() {
    const { path } = useRouteMatch();

    return (
        <Route>
            <ApplicationRoutes path={path} />
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
    applicationReducer,
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
    UserForm,
    profileActions
};
