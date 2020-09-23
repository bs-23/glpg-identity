import { NavLink } from 'react-router-dom';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import React, { useEffect, useState } from "react";

import _ from 'lodash';
import ConsentPerformanceReport from './consent-performance-report.component';
import VeevaConsentPerformanceReport from './veeva-consent-performance-report.component';

const ConsentPerformanceFinalReport = () => {
    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/consent">Data Privacy & Consent Management</NavLink></li>
                                <li className="breadcrumb-item active"><span>Consent Performance Report</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div>
                            <div className="d-sm-flex justify-content-between align-items-center mb-3 mt-4">
                                <h4 className="cdp-text-primary font-weight-bold mb-0">Consent Performance Report</h4>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/consent/cdp-consent-performance-report">Customer Data Platform</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/consent/veeva-consent-performance-report">Veeva CRM</NavLink></li>
                            </ol>
                        </nav>
                    </div>
                </div>

                {/* <Tabs defaultActiveKey="cdp" id="consent_report">
                    <Tab eventKey="cdp" title="Customer Data Platform">
                        <ConsentPerformanceReport/>
                    </Tab>
                    <Tab eventKey="veeva" title="Veeva CRM">
                        <VeevaConsentPerformanceReport/>
                    </Tab>
                </Tabs> */}


            </div>
        </main>
    );
}


export default ConsentPerformanceFinalReport;
