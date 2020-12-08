import React from 'react';
import ClientRoutes from './client/role.routes';
import roleReducer from './client/role.reducer';

export function RoleClientRoutes(props) {
    return <ClientRoutes path={props.path}/>;
}

export { roleReducer };
