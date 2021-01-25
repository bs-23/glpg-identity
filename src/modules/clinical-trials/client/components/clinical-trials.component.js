import React from 'react';
import { NavLink } from 'react-router-dom';
import { Faq } from '../../../platform';

const ClinicalTrials = () => {
    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item active"><span>Clinical Trials</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-lg-8 col-xl-9 py-3">
                        <h2 className="d-flex align-items-center mb-3 px-3 page-title">
                            <i className="icon icon-information-management icon-2x d-block page-title__icon"></i>
                            <span className="page-title__text font-weight-bold pl-3">Clinical Trials</span>
                        </h2>
                        <div className="shadow-sm bg-white">
                            <div className="row">
                                <div className="col-12">
                                    <div className="list-group cdp-list-group">
                                        <NavLink to="/clinical-trials/trial" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link">
                                            <i className="icon icon-secure icon-3x icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Manage Content Clinical Trail</strong>
                                                <span className="d-block cdp-list-group__link-description">Manage Content for each Clinical Trail</span>
                                                <span className="d-block cdp-list-group__link-activity">5 - 7 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-handshake icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Manage general disclaimer for specific, all or multi-selected assignment</strong>
                                                <span className="d-block cdp-list-group__link-description">Manage general disclaimer for specific, all or multi-selected assignment</span>
                                                <span className="d-block cdp-list-group__link-activity">5 - 7 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-network icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Manage the Scheduler to update the Clinical Trials database</strong>
                                                <span className="d-block cdp-list-group__link-description">Manage the Scheduler to update the Clinical Trials database</span>
                                                <span className="d-block cdp-list-group__link-activity">5 - 7 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-calendar icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Version Control and Audit Log of content changes</strong>
                                                <span className="d-block cdp-list-group__link-description">Version Control and Audit Log of content changes</span>
                                                <span className="d-block cdp-list-group__link-activity">5 - 7 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-switch icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Manage Patient application for a specific clinical trail</strong>
                                                <span className="d-block cdp-list-group__link-description">Manage Patient application for a specific clinical trail</span>
                                                <span className="d-block cdp-list-group__link-activity">5 - 7 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="/information/discover-professionals" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-search-globally icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Manage GPS coordinates of the HCO</strong>
                                                <span className="d-block cdp-list-group__link-description">Manage GPS coordinates of the HCO</span>
                                                <span className="d-block cdp-list-group__link-activity">5 - 7 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-place icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Manage Mapping between OneKey ID of Workplace and Clincial trail locations</strong>
                                                <span className="d-block cdp-list-group__link-description">Manage Mapping between OneKey ID of Workplace and Clincial trail locations</span>
                                                <span className="d-block cdp-list-group__link-activity">5 - 7 minutes</span>
                                            </span>
                                        </NavLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-4 col-xl-3 py-3 app__content-panel-right">
                        <Faq topic="information-management" />
                    </div>
                </div>
            </div>
        </main>
    );
}

export default ClinicalTrials;
