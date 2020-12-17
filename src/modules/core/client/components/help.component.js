import React, { useEffect } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import parse from 'html-react-parser';
import { useSelector, useDispatch } from 'react-redux';
import { getFaqItems, getFaqCategories } from '../../../platform/faq/client/faq.actions';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import { Tabs, Tab } from 'react-bootstrap';
import Axios from 'axios';

export default function Help() {
    const faqData = useSelector(state => state.faqReducer.faq_items);
    const faqTopics = useSelector(state => state.faqReducer.faq_topics);
    const dispatch = useDispatch();

    useEffect(() => {
        if (faqData.faq && faqData.faq.length > 0 && faqTopics) {
            console.log(faqMapping(faqTopics, faqData.faq));
        }

    }, [faqData, faqTopics]);

    useEffect(() => {
        dispatch(getFaqItems("?page=null"));
        dispatch(getFaqCategories());
    }, []);

    const faqMapping = (topics, faq) => {

        const faqWithTopics = [];

        const parentCategories = [...new Set(Object.values(topics).map((item) => item.category))];

        parentCategories.forEach(element => {
            const subcategories = topics.filter(x => x.category === element);
            subcategories.forEach(item => {
                delete item.category;
                item.faq = faq.filter(x => x.categories.indexOf(item.slug) >= 0);
            });
            faqWithTopics.push({
                category: element,
                subcategories: subcategories
            });
        });
        return faqWithTopics;
    }

    return (
        <React.Fragment>
            <main className="app__content cdp-light-bg h-100">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12 px-0">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb rounded-0 mb-0">
                                    <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                    <li className="breadcrumb-item active"><span>Help</span></li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                    {faqData.faq && faqData.faq.length > 0 && <div className="container px-0 py-2">
                        <div className="row">
                            
                            <div className="col-12"><h4 className="cdp-text-primary pb-2">Categories</h4></div>
                            <div className="col-12 col-sm-6 col-lg-6">
                                <ul className="list-group shadow-sm faq__list-group mb-4">
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-tachometer-alt fa-2x cdp-text-secondary faq__list-group-icon"></i>
                                            <span className="pr-3 font-weight-bold">General Questions</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">14</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                </ul>
                                <ul className="list-group shadow-sm faq__list-group mb-4">
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <i className="icon icon-data-consent-management icon-2x cdp-text-secondary faq__list-group-icon"></i>
                                            <span className="pr-3 font-weight-bold">Data Privacy & Consent Management</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">14</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <i className="icon icon-manage-profile icon-2x cdp-text-primary faq__list-group-icon"></i>
                                            <span className="pr-3">Manage New Consent</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">1</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <i className="icon icon-accept icon-2x cdp-text-primary faq__list-group-icon"></i>
                                            <span className="pr-3">Configure Consent Category</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">1</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <i className="icon icon-global icon-2x cdp-text-primary faq__list-group-icon"></i>
                                            <span className="pr-3">Assign Consent to Country</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">1</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <i className="icon icon-handshake icon-2x cdp-text-primary faq__list-group-icon"></i>
                                            <span className="pr-3">Generate Data Privacy Report & Consent Performance Management Report</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">1</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                </ul>
                            </div>
                            <div className="col-12 col-sm-6 col-lg-6">
                                <ul className="list-group shadow-sm faq__list-group mb-4">
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <i className="icon icon-information-management icon-2x cdp-text-secondary faq__list-group-icon"></i>
                                            <span className="pr-3 font-weight-bold">Information Management</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">14</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <i class="icon icon-secure icon-2x cdp-text-primary faq__list-group-icon"></i>
                                            <span className="pr-3">Manage HCP Master Data</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">1</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <i class="icon icon-search-globally icon-2x cdp-text-primary faq__list-group-icon"></i>
                                            <span className="pr-3">Discover Missing HCPs and HCOs</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">1</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                </ul>
                                <ul className="list-group shadow-sm faq__list-group mb-4">
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <i className="icon icon-customer-data-platform icon-2x cdp-text-secondary faq__list-group-icon"></i>
                                            <span className="pr-3 font-weight-bold">Management of Customer Data Platform</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">14</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <i class="icon icon-user-setting icon-2x cdp-text-primary faq__list-group-icon"></i>
                                            <span className="pr-3">User & Access Management</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">1</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <i class="icon icon-user-heart icon-2x cdp-text-primary faq__list-group-icon"></i>
                                            <span className="pr-3">Manage Profiles</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">1</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <i class="icon icon-key icon-2x cdp-text-primary faq__list-group-icon"></i>
                                            <span className="pr-3">Define Roles</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">1</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <i class="icon icon-role icon-2x cdp-text-primary faq__list-group-icon"></i>
                                            <span className="pr-3">Manage Permission Sets</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">1</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <i class="icon icon-help icon-2x cdp-text-primary faq__list-group-icon"></i>
                                            <span className="pr-3">Manage FAQs</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">1</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                </ul>
                            </div>
                            <div className="col-12">
                                <div className="faq border-bottom mb-3 shadow-sm p-3 mt-3 bg-white">
                                    <h5 className="cdp-text-primary pb-2"></h5>
                                    <Accordion defaultActiveKey="0" className="faq__body">
                                        {faqData.faq.filter(f => f.categories.includes('general')).map((faq, index) => (
                                            <Card key={index}>
                                                <Accordion.Collapse eventKey={index + ""}>
                                                    <Card.Body className="bg-white border">{parse(faq.answer)}</Card.Body>
                                                </Accordion.Collapse>
                                                <Accordion.Toggle as={Card.Header} eventKey={index + ""} className="px-3 bg-light py-2 d-flex align-items-baseline justify-content-between" role="button">
                                                    <span className="faq__question">{faq.question}</span>
                                                    <i className="icon icon-arrow-down ml-2 faq__icon-down"></i>
                                                </Accordion.Toggle>
                                            </Card>
                                        ))}
                                        {faqData.faq.filter(f => f.categories.includes('general')).length === 0 &&
                                            <Card>
                                                <Card.Body className="text-center">
                                                    <i className="icon icon-help cdp-text-secondary icon-3x"></i>
                                                    <p className="pt-3 font-weight-bold"> No data found related to this category.</p>
                                                </Card.Body>
                                            </Card>
                                        }
                                    </Accordion>
                                </div>
                            </div>
                        </div>
                    </div>}
                </div>
            </main>
        </React.Fragment>
    );
}
