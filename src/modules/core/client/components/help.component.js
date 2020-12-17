import React, { useEffect, useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import { useSelector, useDispatch } from 'react-redux';
import { getFaqItems, getFaqCategories } from '../../../platform/faq/client/faq.actions';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import parse from 'html-react-parser';

export default function Help() {
    const faq = useSelector(state => state.faqReducer.faq_items);
    const faqTopics = useSelector(state => state.faqReducer.faq_topics);
    const [faqData, setFaqData] = useState(null);
    const [selectedfaq, setSelectedfaq] = useState([]);
    const [show, setShow] = useState(false);
    const handleClose = () => { setShow(false), setSelectedfaq([]) };
    const handleShow = (faq) => { setShow(true); setSelectedfaq(faq); };

    const dispatch = useDispatch();

    useEffect(() => {
        if (faq.faq && faq.faq.length > 0 && faqTopics) {
            setFaqData(faqMapping(faqTopics, faq.faq));
        }

    }, [faq]);

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
                item.faq = faq.filter(x => x.topics.indexOf(item.slug) >= 0);
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
                    {faq.faq && faq.faq.length > 0 && faqData && <div className="container px-0 py-2">
                        <div className="row">

                            <div className="col-12"><h3 className="cdp-text-primary py-3">Topics</h3></div>
                            {
                                faqData.map((category, index) => (
                                    <div key={index} className="col-12 col-sm-6 col-lg-6">
                                        <ul className="list-group shadow-sm faq__list-group mb-4">
                                            {category.subcategories.map((topics, id) => (
                                                <li key={id} className="list-group-item d-flex justify-content-between align-items-center">
                                                    <div className="d-flex align-items-center">
                                                        <i className={`${topics.icon} ${id === 0 ? 'cdp-text-secondary' : 'cdp-text-primary'} faq__list-group-icon`}></i>
                                                        <span className="pr-3">{topics.title}</span>
                                                        <span className="badge badge-light badge-pill cdp-text-primary">{topics.faq.length}</span>
                                                    </div>
                                                    <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open" onClick={() => handleShow(topics.faq)}></i>
                                                </li>
                                            ))}

                                        </ul>
                                    </div>
                                ))
                            }

                            <Modal size="lg" centered show={show} onHide={handleClose}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Questions You May Have</Modal.Title>
                                </Modal.Header>
                                <Modal.Body className="faq">
                                    <Accordion defaultActiveKey="0" className="faq__body">
                                        {
                                            selectedfaq.map((item, index) => (
                                                <Card key={index}>
                                                    <Accordion.Collapse eventKey={index + ""}>
                                                        <Card.Body>{parse(parse(item.answer))}</Card.Body>
                                                    </Accordion.Collapse>
                                                    <Accordion.Toggle as={Card.Header} eventKey={index + ""} className="p-3 d-flex align-items-baseline justify-content-between" role="button">
                                                        <span className="faq__question">{item.question}</span>
                                                        <i className="icon icon-arrow-down ml-2 faq__icon-down"></i>
                                                    </Accordion.Toggle>
                                                </Card>
                                            ))
                                        }
                                        {selectedfaq.length === 0 ?
                                            <div className="bg-white text-center py-3 px-2 border-0">
                                                <i className="icon icon-help icon-3x cdp-text-secondary"></i>
                                                <h5 className="cdp-text-primary pt-4">No data found related to this service category</h5>
                                            </div> : null
                                        }
                                    </Accordion>
                                </Modal.Body>

                            </Modal>

                        </div>
                    </div>}
                </div>
            </main>
        </React.Fragment>
    );
}
