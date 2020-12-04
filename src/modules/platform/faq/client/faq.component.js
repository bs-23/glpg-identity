import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import parse from 'html-react-parser';
import { useSelector, useDispatch } from 'react-redux';
import { getFaqItems } from '../../../platform/faq/client/faq.actions';

export default function Faq(props) {
    const [show, setShow] = React.useState();
    const { serviceCategories } = useSelector(state => state.userReducer.loggedInUser);
    const faqData = useSelector(state => state.faqReducer.faq_items);
    const dispatch = useDispatch();

    const hasPlatformPermission = (serviceCategories || []).filter(sc => sc.slug === 'platform').length > 0;
    const faqsPerpage = hasPlatformPermission ? 5 : null;

    useEffect(() => {
        dispatch(getFaqItems(1, props.category, null, null, faqsPerpage));
    }, []);

    return (
        <React.Fragment>
            <div className={`faq h-100 shadow-sm bg-white ${show ? "faq-expand" : ""}`}>
                <h4 className="faq__header p-3 font-weight-bold mb-0 d-flex justify-content-between">
                    FAQ Hints
                    <i onClick={() => setShow(true)} type="button" class="icon icon-expand faq-icon-expand faq__icon-toggle d-none d-lg-block"></i>
                    <i class="icon icon-minimize faq-icon-minimize  faq__icon-toggle" type="button" onClick={() => setShow(false)}></i>
                    <i className="icon icon-help faq__icon-help d-block d-lg-none"></i>
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
                    {hasPlatformPermission && faqData.faq && faqData.faq.length > 0 &&
                        <Card className="border-0">
                            <NavLink to={`platform-management/manage-faq?page=1&category=${props.category}`} className="p-3 pb-0 mb-0 w-100 d-flex align-items-center bg-white cdp-text-secondary">
                                More FAQ's
                            </NavLink>
                        </Card>
                    }
                </Accordion>


                {faqData.faq && faqData.faq.length === 0 &&
                    <div className="bg-white text-center py-3 px-2 border-top">
                        <i className="icon icon-help icon-3x cdp-text-secondary"></i>
                        <h5 className="cdp-text-primary pt-4">No FAQ found related this category</h5>
                        <p className="py-2 mb-4">Click on the button below to add related this category from FAQ list</p>
                        <NavLink to="platform-management/manage-faq" className="btn cdp-btn-secondary text-white px-5 py-2 font-weight-bold">
                            <i className="fas fa-list-ul pr-1"></i> FAQ List
                        </NavLink>
                    </div>
                }

            </div>
        </React.Fragment>

    );
}
