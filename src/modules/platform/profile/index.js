import React from 'react';
import ClientRoutes from './client/profile.routes';
import profileReducer from './client/profile.reducer';
import ManageProfiles from './client/profiles.component';
import * as profileActions from './client/profile.actions';

export function ProfileClientRoutes(props) {
    return <ClientRoutes path={props.path}/>;
}

export {
    profileReducer,
    ManageProfiles,
    profileActions
};
