import React, { useEffect } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import parse from 'html-react-parser';
import { useSelector, useDispatch } from 'react-redux';
import { getFaqItems } from '../../../platform/faq/client/faq.actions';

export default function Help() {
    const faqData = useSelector(state => state.faqReducer.faq_items);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getFaqItems());
    }, []);

    return (
        <React.Fragment>
                <h4 className="faq__header p-3 font-weight-bold mb-0 d-flex justify-content-between">
                    CDP Help Center
                </h4>

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
                </Accordion>

                {faqData.faq && faqData.faq.length === 0 &&
                    <div className="bg-white text-center py-3 px-2 border-top">
                        <i className="icon icon-help icon-3x cdp-text-secondary"></i>
                        <h5 className="cdp-text-primary pt-4">No data found!</h5>
                    </div>
                }
        </React.Fragment>
    );
}
