import React from 'react';
import ClientRoutes from './client/hcp.routes';
import hcpReducer from './client/hcp.reducer';
import HCPUsers from './client/components/hcp-users';
import InformationManagement from './client/components/information-management.component';

export function HCPClientRoutes(props) {
    return <ClientRoutes path={props.path}/>;
}

export {
    hcpReducer,
    HCPUsers,
    InformationManagement
};
