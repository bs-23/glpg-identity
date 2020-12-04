import React, { useEffect } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import parse from 'html-react-parser';
import { useSelector, useDispatch } from 'react-redux';
import { getFaqItems } from '../../../platform/faq/client/faq.actions';
import { NavLink, useLocation, useHistory } from 'react-router-dom';

export default function Help() {
    const faqData = useSelector(state => state.faqReducer.faq_items);
    const dispatch = useDispatch();

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
                                <ol className="breadcrumb rounded-0">
                                    <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                    <li className="breadcrumb-item active"><span>Help</span></li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <div className="d-sm-flex justify-content-between align-items-center">
                                <h4 className="cdp-text-primary font-weight-bold py-3">
                                    CDP Help Center
                                </h4>
                            </div>
                            <div className="help-center">
                                <div className="row">
                                    <div className="col-12 col-md-6">
                                        <div className="help-center__card mb-3 shadow-sm bg-white faq">
                                            <h6 className="cdp-bg-primary-lighter text-white mb-0 px-3 py-2">General</h6>
                                            <Accordion defaultActiveKey="0" className="faq__body">
                                                {faqData.faq && faqData.faq.filter(f => f.categories.includes('general')).map((faq, index) => (
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
                                            </Accordion>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="help-center__card mb-3 shadow-sm bg-white faq">
                                            <h6 className="cdp-bg-primary-lighter text-white mb-0 px-3 py-2">Information</h6>
                                            <Accordion className="faq__body">
                                                {faqData.faq && faqData.faq.filter(f => f.categories.includes('information')).map((faq, index) => (
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
                                            </Accordion>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="help-center__card mb-3 shadow-sm bg-white faq">
                                            <h6 className="cdp-bg-primary-lighter text-white mb-0 px-3 py-2">Platform</h6>
                                            <Accordion className="faq__body">
                                                {faqData.faq && faqData.faq.filter(f => f.categories.includes('cdp')).map((faq, index) => (
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
                                            </Accordion>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="help-center__card mb-3 shadow-sm bg-white faq">
                                            <h6 className="cdp-bg-primary-lighter text-white mb-0 px-3 py-2">Privacy</h6>
                                            <Accordion className="faq__body">
                                                {faqData.faq && faqData.faq.filter(f => f.categories.includes('privacy')).map((faq, index) => (
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
                                            </Accordion>
                                        </div>
                                    </div>
                                    
                                </div>
                                
                                {faqData.faq && faqData.faq.length === 0 &&
                                    <div className="bg-white text-center py-3 px-2 border rounded shadow-sm">
                                        <i className="icon icon-help icon-3x cdp-text-secondary"></i>
                                        <h5 className="cdp-text-primary pt-4">No data found!</h5>
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
