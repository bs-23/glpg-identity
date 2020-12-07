import React from 'react';
import ClientRoutes from './client/profile.routes';
import profileReducer from './client/profile.reducer';

export function ProfileClientRoutes(props) {
    return <ClientRoutes path={props.path}/>;
}

export { profileReducer };
