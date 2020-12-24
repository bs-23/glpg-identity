import React from 'react';
import ClientRoutes from './client/permission-set.routes';
import permissionSetReducer from './client/permission-set.reducer';
import { PermissionSetDetailsModal } from './client/permission-sets-details';
import ManagePermissionSets from './client/permission-sets.component';

export function PermissionSetClientRoutes(props) {
    return <ClientRoutes path={props.path}/>;
}

export {
    permissionSetReducer,
    PermissionSetDetailsModal,
    ManagePermissionSets
};
