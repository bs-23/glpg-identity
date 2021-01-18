import React from 'react';
import ClientRoutes from './client/manage-partners.routes';
import managePartnerReducer from './client/manage-partners.reducer';
import * as managePartnerActions from './client/manage-partners.actions';


export function ManagePartnersClientRoutes(props) {
    return <ClientRoutes path={props.path} />;
}

export {
    managePartnerReducer,
    managePartnerActions
};

