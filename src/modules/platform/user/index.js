import React from 'react';
import ClientRoutes from './client/user.routes';
import userReducer from './client/user.reducer';

export function UserClientRoutes(props) {
    return <ClientRoutes path={props.path}/>;
}

export { userReducer };
