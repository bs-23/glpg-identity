import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import FaqForm from './faq-form.component';
import axios from "axios";
import { getFaqItems, deleteFaqItem } from './faq.actions';
import { useSelector, useDispatch } from 'react-redux';
import parse from 'html-react-parser';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import { useToasts } from 'react-toast-notifications';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';

export default function Faq(props) {
    const [show, setShow] = React.useState();
    useEffect(() => {
    }, []);

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

                    {props.category && props.category.map((faq, index) => (
                        <Card>
                            <Accordion.Collapse eventKey={index + ""}>
                                <Card.Body>{faq.answer}</Card.Body>
                            </Accordion.Collapse>
                            <Accordion.Toggle as={Card.Header} eventKey={index + ""} className="p-3 d-flex align-items-baseline justify-content-between" role="button">
                                {faq.question}
                                <i className="icon icon-arrow-down ml-2 faq__icon-down"></i>
                            </Accordion.Toggle>

                        </Card>

                    ))}
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
