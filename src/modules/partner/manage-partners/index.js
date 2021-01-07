import React from 'react';
import ClientRoutes from './client/manage-partners.routes';
import managePartnersReducer from './client/manage-partners.reducer';
import * as managePartnersActions from './client/manage-partners.actions';

export function ManagePartnersClientRoutes(props) {
    return <ClientRoutes path={props.path}/>;
}

export {
    managePartnersReducer,
    managePartnersActions,
 };
