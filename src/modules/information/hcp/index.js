import React from 'react';
import ClientRoutes from './client/hcp.routes';
import hcpReducer from './client/hcp.reducer';
import HCPUsers from './client/components/hcp-profiles.component';
import CrdlpHcpProfiles from './client/components/crdlp-hcp-profiles.component';
import InformationManagement from './client/components/information-management.component';
import SearchOrganizationHCP from './client/components/search-organization-hcp.component';
import SearchProfessionalHCP from './client/components/search-professional-hcp.component';
import HCPFilter from './client/components/hcp-filter.component';
import MultichannelConsentSync from './client/components/multichannel-consent-sync.component';

export function HCPClientRoutes(props) {
    return <ClientRoutes path={props.path}/>;
}

export {
    hcpReducer,
    HCPUsers,
    CrdlpHcpProfiles,
    InformationManagement,
    SearchOrganizationHCP,
    SearchProfessionalHCP,
    HCPFilter,
    MultichannelConsentSync
};
