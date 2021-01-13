import React from 'react';
import ClientRoutes from './client/business-partner-management.routes';

export function BusinessPartnerManagementClientRoutes(props) {
    return <ClientRoutes path={props.path} />;
}
