import React, { useEffect, useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import { useSelector, useDispatch } from 'react-redux';
import { getFaqItems, getFaqCategories } from '../../../platform/faq/client/faq.actions';
import { NavLink } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import parse from 'html-react-parser';
import Dropdown from 'react-bootstrap/Dropdown';

export default function Help() {
    const faq = useSelector(state => state.faqReducer.faq_items);
    const faqTopics = useSelector(state => state.faqReducer.faq_topics);
    const [faqData, setFaqData] = useState(null);
    const [selectedfaq, setSelectedfaq] = useState([]);
    const [show, setShow] = useState(false);
    const handleClose = () => { setShow(false); setSelectedfaq([]) };
    const handleShow = (selectedFaq) => { setShow(true); setSelectedfaq(selectedFaq); };

    const dispatch = useDispatch();

    useEffect(() => {

        if (faqTopics) {
            if (faq.faq && faq.faq.length > 0) {
                setFaqData(faqMapping(faqTopics, faq.faq));
            } else {
                setFaqData(faqMapping(faqTopics, null));
            }

        }

    }, [faq]);

    useEffect(() => {
        dispatch(getFaqItems("?page=null"));
        dispatch(getFaqCategories());
    }, []);

    const faqMapping = (topics, faqs) => {

        const faqWithTopics = [];

        const parentCategories = [...new Set(Object.values(topics).map((item) => item.category))];

        parentCategories.forEach(element => {
            const subcategories = topics.filter(x => x.category === element);
            subcategories.forEach(item => {
                delete item.category;
                if (faqs) item.faq = faqs.filter(x => x.topics.indexOf(item.slug) >= 0);
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
                            <nav className="breadcrumb justify-content-between align-items-center" aria-label="breadcrumb">
                                <ol className="rounded-0 m-0 p-0 d-none d-sm-flex">
                                    <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                    <li className="breadcrumb-item active"><span>Help</span></li>
                                </ol>
                                <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                    <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                        <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                        <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> Help</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </nav>
                        </div>
                    </div>
                    {faqData && <div className="container px-0 py-2">
                        <div className="row">

                            <div className="col-12"><h3 className="cdp-text-primary py-3">Topics</h3></div>

                            <div className="col-12 col-sm-6 col-lg-6">
                                {faqData.map((category, index) => (
                                    (index % 2) === 0 && <ul key={index} className="list-group shadow-sm faq__list-group mb-4">
                                        {category.subcategories.map((topics, id) => (
                                            <li key={id} className="list-group-item d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center">
                                                    <i className={`${topics.icon} ${id === 0 ? 'cdp-text-secondary' : 'cdp-text-primary'} faq__list-group-icon`}></i>
                                                    <span className="pr-3">{topics.title}</span>
                                                    <span className="badge badge-light badge-pill cdp-text-primary">{topics.faq ? topics.faq.length : 0}</span>
                                                </div>
                                                <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open" onClick={() => handleShow(topics.faq)}></i>
                                            </li>
                                        ))}

                                    </ul>
                                ))}
                            </div>

                            <div className="col-12 col-sm-6 col-lg-6">
                                {faqData.map((category, index) => (
                                    (index % 2) !== 0 && <ul key={index} className="list-group shadow-sm faq__list-group mb-4">
                                        {category.subcategories.map((topics, id) => (
                                            <li key={id} className="list-group-item d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center">
                                                    <i className={`${topics.icon} ${id === 0 ? 'cdp-text-secondary' : 'cdp-text-primary'} faq__list-group-icon`}></i>
                                                    <span className="pr-3">{topics.title}</span>
                                                    <span className="badge badge-light badge-pill cdp-text-primary">{topics.faq ? topics.faq.length : 0}</span>
                                                </div>
                                                <i className="fas fa-external-link-square-alt cdp-text-primary faq__list-group--modal-open" onClick={() => handleShow(topics.faq)}></i>
                                            </li>
                                        ))}

                                    </ul>
                                ))}
                            </div>


                            <Modal size="lg" centered show={show} onHide={handleClose}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Questions You May Have</Modal.Title>
                                </Modal.Header>
                                <Modal.Body className="faq">
                                    <Accordion defaultActiveKey="0" className="faq__body">
                                        {
                                            selectedfaq && selectedfaq.map((item, index) => (
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
                                        {!selectedfaq || (selectedfaq && selectedfaq.length === 0) ?
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
