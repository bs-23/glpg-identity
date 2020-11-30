import React from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import { NavLink } from 'react-router-dom';


const Faq = () => {
    const [show, setShow] = React.useState();

    return (
        <React.Fragment>
            <div className={`faq h-100 shadow-sm bg-white ${show ? "faq-expand" : ""}`}>
                <h4 className="faq__header p-3 font-weight-bold mb-0 d-flex justify-content-between">
                    FAQ Hints
                    <i onClick={() => setShow(true)} type="button" class="icon icon-expand faq-icon-expand faq__icon-toggle  d-none d-lg-block"></i>
                    <i class="icon icon-minimize faq-icon-minimize  faq__icon-toggle" type="button" onClick={() => setShow(false)}></i>
                    <i className="icon icon-help faq__icon-help d-block d-lg-none"></i>
                </h4>
                <Accordion defaultActiveKey="0" className="faq__body">
                    <Card>
                        <Accordion.Collapse eventKey="0">
                            <Card.Body>A Customer Data Platform (CDP) is a software that aggregates and organizes customer data across a variety of touchpoints and is used by other software, systems, and marketing efforts. CDPs collect and structure real-time data into individual, centralized customer profiles.</Card.Body>
                        </Accordion.Collapse>
                        <Accordion.Toggle as={Card.Header} eventKey="0" className="p-3 d-flex align-items-baseline justify-content-between" role="button">
                            What is a Customer Data Platform?
                        <i className="icon icon-arrow-down ml-2 faq__icon-down"></i>
                        </Accordion.Toggle>
                       
                    </Card>
                    <Card>
                        <Accordion.Collapse eventKey="1">
                            <Card.Body>CDPs exist because customer data has become crucial to both business and marketing operations. So, what is customer data exactly? <br />
                                Customer data is information consumers leave behind as they use the internet and interact with companies online and offline: through websites, blogs, e-commerce portals, and in-store interactions. (We dive into some examples below.) It’s highly valuable to businesses, although recent legal dialogue (such as the GDPR) has changed how organizations collect and manage this data.</Card.Body>
                        </Accordion.Collapse>
                        <Accordion.Toggle as={Card.Header} eventKey="1" className="p-3 d-flex align-items-baseline justify-content-between" role="button">
                            What is customer data?
                        <i className="icon icon-arrow-down ml-2 faq__icon-down"></i>
                        </Accordion.Toggle>
                        
                    </Card>
                    <Card>
                        <Accordion.Collapse eventKey="2">
                            <Card.Body>CDPs improve your organization, better your customer relationships, and complement your current software and marketing efforts. Here are a handful of key benefits of having a CDP.</Card.Body>
                        </Accordion.Collapse>
                        <Accordion.Toggle as={Card.Header} eventKey="2" className="p-3 d-flex align-items-baseline justify-content-between" role="button">
                            Key Benefits of a CDP
                        <i className="icon icon-arrow-down ml-2 faq__icon-down"></i>
                        </Accordion.Toggle>
                       
                    </Card>
                    <Card>
                        <Accordion.Collapse eventKey="3">
                            <Card.Body>A main advantage of a CDP is its ability to collect data from a variety of sources (both online and offline, with a variety of formats and structures) and convert that disparate data into a standardized form.</Card.Body>
                        </Accordion.Collapse>
                        <Accordion.Toggle as={Card.Header} eventKey="3" className="p-3 d-flex align-items-baseline justify-content-between" role="button">
                            Data Collection
                        <i className="icon icon-arrow-down ml-2 faq__icon-down"></i>
                        </Accordion.Toggle>
                        
                    </Card>
                    <Card className="border-0">
                        <NavLink to="platform-management/manage-faq" className="p-3 pb-0 mb-0 w-100 d-flex align-items-center bg-white cdp-text-secondary">
                           More FAQ's 
                        </NavLink>
                    </Card>
                </Accordion> 
            </div>
        </React.Fragment>
    );
}
 
export default Faq;
