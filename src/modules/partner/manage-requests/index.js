import React from 'react';
import ClientRoutes from './client/manage-requests.routes';
import manageRequestsReducer from './client/manage-requests.reducer';
import * as manageRequestsActions from './client/manage-requests.actions';

export function ManagePartnersClientRoutes(props) {
    return <ClientRoutes path={props.path} />;
}

export {
    manageRequestsReducer,
    manageRequestsActions
};
