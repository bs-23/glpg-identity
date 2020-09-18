import { NavLink } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { Form, Formik, Field, ErrorMessage } from "formik";
import { useToasts } from 'react-toast-notifications';
import axios from 'axios';

import _ from 'lodash';
import parse from 'html-react-parser';
import { getConsentReport } from '../consent.action';
import ConsentPerformanceReport from './consent-performance-report.component';

const ConsentsList = () => {
    
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

                <Tabs defaultActiveKey="cdp" id="consent_report">
                    <Tab eventKey="cdp" title="Customer Data Platform">
                        <ConsentPerformanceReport/>
                    </Tab>
                    <Tab eventKey="veeva" title="Veeva CRM">
                        <ConsentPerformanceReport/>
                    </Tab>
                </Tabs>


            </div>
        </main>
    );
}


export default ConsentsList;