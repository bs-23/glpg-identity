import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import parse from 'html-react-parser';
import { useSelector, useDispatch } from 'react-redux';
import { getFaqItems } from '../../../platform/faq/client/faq.actions';

export default function Faq(props) {
    const [show, setShow] = React.useState();
    const faqData = useSelector(state => state.faqReducer.faq_items);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getFaqItems(`?page=1&category=${props.category}&limit=5`));
    }, []);

    return (
        <React.Fragment>
            <div className={`faq h-100 shadow-sm bg-white ${show ? "faq-expand" : ""}`}>
                <h5 className="faq__header p-3 font-weight-bold mb-0 d-flex justify-content-between">
                    Questions You May Have
                    <i onClick={() => setShow(true)} type="button" class="icon icon-expand faq-icon-expand faq__icon-toggle d-none d-lg-block"></i>
                    <i class="icon icon-minimize faq-icon-minimize  faq__icon-toggle" type="button" onClick={() => setShow(false)}></i>
                    <i className="icon icon-help faq__icon-help d-block d-lg-none"></i>
                </h5>
                <Accordion defaultActiveKey="0" className="faq__body">
                    {faqData.faq && faqData.faq.map((faq, index) => (
                        <Card key={index}>
                            <Accordion.Collapse eventKey={index + ""}>
                                <Card.Body>{parse(faq.answer)}</Card.Body>
                            </Accordion.Collapse>
                            <Accordion.Toggle as={Card.Header} eventKey={index + ""} className="p-3 d-flex align-items-baseline justify-content-between" role="button">
                                <span className="faq__question">{faq.question}</span>
                                <i className="icon icon-arrow-down ml-2 faq__icon-down"></i>
                            </Accordion.Toggle>
                        </Card>
                    ))}

                    {faqData.metadata && faqData.metadata.total > 5 &&
                        <Card className="border-0">
                            <NavLink to="help" className="p-3 pb-0 mb-0 w-100 d-flex align-items-center bg-white cdp-text-secondary">
                                Visit CDP help center for more
                            </NavLink>
                        </Card>
                    }
                </Accordion>

                { faqData.faq && faqData.faq.length === 0 &&
                    <div className="bg-white text-center py-3 px-2">
                        <i className="icon icon-help faq__no-data-found-lg-icon cdp-text-secondary"></i>
                        <h4 className="cdp-text-primary">No data found!</h4>
                    </div>
                }
            </div>
        </React.Fragment>
    );
}
