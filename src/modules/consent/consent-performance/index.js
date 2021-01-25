import React from 'react';
import ClientRoutes from './client/consent-performance.routes';
import consentPerformanceReducer from './client/consent-performance.reducer';
import * as consentPerformanceActions from './client/consent-performace.actions';
import CDPConsentPermanceReport from './client/cdp-consent-performance-report.component';
import VeevaConsentPermanceReport from './client/veeva-consent-performance-report.component';

export function ConsentPerformanceRoutes(props) {
    return <ClientRoutes path={props.path} />;
}

export {
    consentPerformanceReducer,
    consentPerformanceActions,
    CDPConsentPermanceReport,
    VeevaConsentPermanceReport
};
