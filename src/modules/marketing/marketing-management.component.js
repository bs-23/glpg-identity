import React from 'react';
import { NavLink } from 'react-router-dom';
import { Faq } from '../platform';
import Dropdown from 'react-bootstrap/Dropdown';

const MarketingManagement = () => {
    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav className="breadcrumb justify-content-between align-items-center" aria-label="breadcrumb">
                            <ol className="rounded-0 m-0 p-0 d-none d-sm-flex">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item active"><span>Marketing and promotional</span></li>
                            </ol>
                            <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                    <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                    <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> Marketing and promotional</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-lg-8 col-xl-9 py-3">
                        <h2 className="d-flex align-items-center mb-3 px-3 page-title">
                            <i className="icon icon-information-management icon-2x d-block page-title__icon"></i>
                            <span className="page-title__text font-weight-bold pl-3">Marketing and promotional</span>
                        </h2>
                        <div className="shadow-sm bg-white">
                            <div className="row">
                                <div className="col-12">
                                    <div className="list-group cdp-list-group">
                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-handshake icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Material Shop</strong>
                                                <span className="d-block cdp-list-group__link-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor i city within 30 minutes</span>
                                                <span className="d-block cdp-list-group__link-activity">within 30 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="/marketing/mass-mailing" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link">
                                            <i className="icon icon-secure icon-3x icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Manage Mass Mailing</strong>
                                                <span className="d-block cdp-list-group__link-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor i city</span>
                                                <span className="d-block cdp-list-group__link-activity">within 15 minutes</span>
                                            </span>
                                        </NavLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-4 col-xl-3 py-3 app__content-panel-right">
                        <Faq topic="marketing-management" />
                    </div>
                </div>
            </div>
        </main>
    );
}

export default MarketingManagement;
