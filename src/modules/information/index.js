import React from 'react';
import { Route, useRouteMatch } from 'react-router-dom';
import { HCPClientRoutes, hcpReducer, HCPUsers, InformationManagement,SearchOrganizationHCP, SearchProfessionalHCP } from './hcp';

export function InformationRoutes() {
    const { path } = useRouteMatch();

    return (
        <Route>
            <HCPClientRoutes path={path}/>
        </Route>
    );
}

export {
    hcpReducer,
    HCPUsers,
    InformationManagement,
    SearchOrganizationHCP,
    SearchProfessionalHCP
};
