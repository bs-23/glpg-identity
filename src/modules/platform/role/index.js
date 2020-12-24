import React from 'react';
import ClientRoutes from './client/role.routes';
import roleReducer from './client/role.reducer';
import ManageRoles from './client/roles.component';

export function RoleClientRoutes(props) {
    return <ClientRoutes path={props.path}/>;
}

export { roleReducer, ManageRoles };
