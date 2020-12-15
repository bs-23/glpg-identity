import React, { useEffect } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import parse from 'html-react-parser';
import { useSelector, useDispatch } from 'react-redux';
import { getFaqItems } from '../../../platform/faq/client/faq.actions';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import { Tabs, Tab } from 'react-bootstrap';

export default function Help() {
    const faqData = useSelector(state => state.faqReducer.faq_items);
    const dispatch = useDispatch();
    //const [key, setKey] = useState('home');

    useEffect(() => {
        dispatch(getFaqItems());
    }, []);

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
                                            <i className="fas fa-tachometer-alt fa-2x cdp-text-secondary"></i>
                                            <span className="px-3">General Questions</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">14</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                </ul>
                                
                                <ul className="list-group shadow-sm faq__list-group mb-4">
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <i className="icon icon-data-consent-management icon-2x cdp-text-secondary"></i>
                                            <span className="px-3">Data Privacy & Consent Management</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">14</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <span className="pr-3 pl-5">Manage New Consent</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">1</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <span className="pr-3 pl-5">Configure Consent Category</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">1</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <span className="pr-3 pl-5">Assign Consent to Country</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">1</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <span className="pr-3 pl-5">Generate Data Privacy Report & Consent Performance Management Report</span>
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
                                            <i className="icon icon-information-management icon-2x cdp-text-secondary"></i>
                                            <span className="px-3">Information Management</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">14</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <span className="pr-3 pl-5">Manage HCP Master Data</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">1</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <span className="pr-3 pl-5">Discover Missing HCPs and HCOs</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">1</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                </ul>
                                <ul className="list-group shadow-sm faq__list-group mb-4">
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <i className="icon icon-customer-data-platform icon-2x cdp-text-secondary"></i>
                                            <span className="px-3">Management of Customer Data Platform</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">14</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <span className="pr-3 pl-5">User & Access Management</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">1</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <span className="pr-3 pl-5">Manage Profiles</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">1</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <span className="pr-3 pl-5">Manage Permission Sets</span>
                                            <span className="badge badge-light badge-pill cdp-text-primary">1</span>
                                        </div>
                                        <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open"></i>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <span className="pr-3 pl-5">Manage FAQs</span>
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
                    <div className="row">
                        <div className="col-12">
                            <div className="d-sm-flex justify-content-between align-items-center">
                                <h4 className="cdp-text-primary font-weight-bold py-3">
                                    CDP Help Center
                                </h4>
                            </div>
                            <div className="help-center">

                                {faqData.faq && faqData.faq.length > 0 && <div className="row">
                                    <div className="col-12">
                                        <Tabs defaultActiveKey="General" className="faq__tabs">
                                            <Tab eventKey="General" title="General Questions">
                                                
                                            </Tab>
                                            <Tab eventKey="Information" title="Information Management">
                                                <div className="faq p-3">
                                                    <Accordion className="faq__body">
                                                        {faqData.faq.filter(f => f.categories.includes('information')).map((faq, index) => (
                                                            <Card key={index}>
                                                                <Accordion.Collapse eventKey={index + ""}>
                                                                    <Card.Body>{parse(faq.answer)}</Card.Body>
                                                                </Accordion.Collapse>
                                                                <Accordion.Toggle as={Card.Header} eventKey={index + ""} className="px-3 py-2 d-flex align-items-baseline justify-content-between" role="button">
                                                                    <span className="faq__question">{faq.question}</span>
                                                                    <i className="icon icon-arrow-down ml-2 faq__icon-down"></i>
                                                                </Accordion.Toggle>
                                                            </Card>
                                                        ))}
                                                        {faqData.faq.filter(f => f.categories.includes('information')).length === 0 &&
                                                            <Card>
                                                                <Card.Body className="text-center">
                                                                    <i className="icon icon-help cdp-text-secondary icon-3x"></i>
                                                                    <p className="pt-3 font-weight-bold"> No data found related to this category.</p>
                                                                </Card.Body>
                                                            </Card>
                                                        }
                                                    </Accordion>
                                                </div>
                                            </Tab>
                                            <Tab eventKey="Customer" title="Management of Customer Data Platform">
                                                <div className="faq p-3">
                                                    <Accordion className="faq__body">
                                                        {faqData.faq.filter(f => f.categories.includes('cdp')).map((faq, index) => (
                                                            <Card key={index}>
                                                                <Accordion.Collapse eventKey={index + ""}>
                                                                    <Card.Body>{parse(faq.answer)}</Card.Body>
                                                                </Accordion.Collapse>
                                                                <Accordion.Toggle as={Card.Header} eventKey={index + ""} className="px-3 py-2 d-flex align-items-baseline justify-content-between" role="button">
                                                                    <span className="faq__question">{faq.question}</span>
                                                                    <i className="icon icon-arrow-down ml-2 faq__icon-down"></i>
                                                                </Accordion.Toggle>
                                                            </Card>
                                                        ))}
                                                        {faqData.faq.filter(f => f.categories.includes('cdp')).length === 0 &&
                                                            <Card>
                                                                <Card.Body className="text-center">
                                                                    <i className="icon icon-help cdp-text-secondary icon-3x"></i>
                                                                    <p className="pt-3 font-weight-bold"> No data found related to this category.</p>
                                                                </Card.Body>
                                                            </Card>
                                                        }
                                                    </Accordion>
                                                </div>
                                            </Tab>
                                            <Tab eventKey="Privacy" title="Data Privacy Consent Management">
                                                <div className="faq p-3">
                                                    <Accordion className="faq__body">
                                                        {faqData.faq.filter(f => f.categories.includes('privacy')).map((faq, index) => (
                                                            <Card key={index}>
                                                                <Accordion.Collapse eventKey={index + ""}>
                                                                    <Card.Body>{parse(faq.answer)}</Card.Body>
                                                                </Accordion.Collapse>
                                                                <Accordion.Toggle as={Card.Header} eventKey={index + ""} className="px-3 py-2 d-flex align-items-baseline justify-content-between" role="button">
                                                                    <span className="faq__question">{faq.question}</span>
                                                                    <i className="icon icon-arrow-down ml-2 faq__icon-down"></i>
                                                                </Accordion.Toggle>
                                                            </Card>
                                                        ))}
                                                        {faqData.faq.filter(f => f.categories.includes('privacy')).length === 0 &&
                                                            <Card>
                                                                <Card.Body className="text-center">
                                                                    <i className="icon icon-help cdp-text-secondary icon-3x"></i>
                                                                    <p className="pt-3 font-weight-bold"> No data found related to this category.</p>
                                                                </Card.Body>
                                                            </Card>
                                                        }
                                                    </Accordion>
                                                </div>
                                            </Tab>
                                        </Tabs>
                                    </div>
                                </div>}

                                {faqData.faq && faqData.faq.length === 0 &&
                                    <div className="row justify-content-center">
                                        <div className="col-12 col-md-6">
                                            <div className="bg-white text-center py-3 px-2 border rounded shadow-sm">
                                                <i className="icon icon-help icon-3x cdp-text-secondary faq__no-data-found-lg-icon"></i>
                                                <h3 className="cdp-text-primary">No data found!</h3>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </React.Fragment>
    );
}
