import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import FaqForm from './faq-form.component';
import { getFaqItems, deleteFaqItem, getFaqCategories } from './faq.actions';
import { useSelector, useDispatch } from 'react-redux';
import parse from 'html-react-parser';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import Accordion from 'react-bootstrap/Accordion';
import { useToasts } from 'react-toast-notifications';
import Faq from '../../../platform/faq/client/faq.component';

export default function ManageFaq() {
    const [show, setShow] = useState(false);
    const faqData = useSelector(state => state.faqReducer.faq_items);
    const serviceTopics = useSelector(state => state.faqReducer.faq_topics);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState(null);
    // const [topic, setTopic] = useState(null);
    const [sort, setSort] = useState({ type: 'asc', value: null });
    const [showDelete, setShowDelete] = useState(false);
    const [deleteId, setDeleteId] = useState(false);
    const { addToast } = useToasts();
    const dispatch = useDispatch();
    const location = useLocation();
    const history = useHistory();
    const params = new URLSearchParams(window.location.search);
    const [showFaq, setShowFaq] = useState(false);
    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);

    const deleteFaq = () => {
        dispatch(deleteFaqItem(deleteId)).then(() => {
            addToast('FAQ deleted successfully', {
                appearance: 'success',
                autoDismiss: true
            });
            setShowDelete(false);
        }).catch(error => {
            addToast(error.response.data, {
                appearance: 'error',
                autoDismiss: true
            });
        });
    }

    const urlChange = (pageNo, faqCategory, orderColumn, pageChange = false) => {
        let orderType = params.get('orderType');
        const orderBy = params.get('orderBy');
        const page = pageNo ? pageNo : (params.get('page') ? params.get('page') : 1);
        const topic = faqCategory ? encodeURIComponent(faqCategory) : encodeURIComponent(params.get('topic'));

        if (!pageChange) {
            if (orderBy && !orderType) {
                orderType = 'asc'
            }

            (orderBy === orderColumn)
                ? (orderType === 'asc'
                    ? orderType = 'desc'
                    : orderType = 'asc')
                : orderType = 'asc';
        }

        const url = `?page=${page}`
            + (topic && topic !== 'null' ? `&topic=${topic}` : '')
            + (orderColumn && orderColumn !== 'null' ? `&orderBy=${orderColumn}` : '')
            + (orderColumn && orderType && orderType !== 'null' ? `&orderType=${orderType}` : '');

        history.push(location.pathname + url);
    }

    useEffect(() => {
        if (faqData.metadata) { faqData.metadata.topic = null; }
        // setTopic(params.get('topic') ? params.get('topic') : null);
        dispatch(getFaqCategories());
        dispatch(getFaqItems(location.search));
        setSort({ type: params.get('orderType') || 'asc', value: params.get('orderBy') });
    }, [location]);

    const pageLeft = () => {
        if (faqData.metadata.page > 1) urlChange(faqData.metadata.page - 1, faqData.metadata.topic, params.get('orderBy'), true);
    };

    const pageRight = () => {
        if (faqData.metadata.end !== faqData.metadata.total) urlChange(faqData.metadata.page + 1, faqData.metadata.topic, params.get('orderBy'), true);
    };

    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav className="breadcrumb justify-content-between align-items-center" aria-label="breadcrumb">
                            <ol className="rounded-0 m-0 p-0 d-none d-sm-flex">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/platform">Management of Customer Data platform</NavLink></li>
                                <li className="breadcrumb-item active"><span>FAQ</span></li>
                            </ol>
                            <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                    <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                    <Dropdown.Item className="px-2" href="/platform"><i className="fas fa-link mr-2"></i> Management of Customer Data platform</Dropdown.Item>
                                    <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> FAQ</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <span className="ml-auto mr-3"><i type="button" onClick={handleShowFaq} className="icon icon-help breadcrumb__faq-icon cdp-text-secondary"></i></span>
                        </nav>
                       
                        <Modal show={showFaq} onHide={handleCloseFaq} size="lg" centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Questions You May Have</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="faq__in-modal"><Faq topic="manage-faqs" /></Modal.Body>
                        </Modal>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center my-3">
                            <h4 className="cdp-text-primary font-weight-bold mb-0 mb-sm-0 d-flex align-items-end pr-2">
                                FAQ List
                                {faqData.faq && faqData.faq.length > 0 && serviceTopics && serviceTopics.length > 0 &&
                                    <Accordion className="cdp-table__responsive-accordion d-block d-sm-none">
                                        <Accordion.Toggle eventKey="0" className="btn btn-sm borrder-0 shadow-0 mb-0 ml-2"><i className="fas fa-sort cdp-text-primary"></i></Accordion.Toggle>
                                        <Accordion.Collapse eventKey="0" className="cdp-table__responsive-accordion-body">
                                            <div className="cdp-bg-primary p-2 text-white">
                                                <span className={sort.value === 'question' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, faqData.metadata.topic, 'question')}>Question<i className="icon icon-sort cdp-table__icon-sorting"></i></span>
                                                <span className={sort.value === 'answer' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, faqData.metadata.topic, 'answer')}>Answer<i className="icon icon-sort cdp-table__icon-sorting"></i></span>
                                                <span className={sort.value === 'topics' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, faqData.metadata.topic, 'topics')}>Topics<i className="icon icon-sort cdp-table__icon-sorting"></i></span>
                                                <span className={sort.value === 'created_by' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, faqData.metadata.topic, 'created_by')}>Created By<i className="icon icon-sort cdp-table__icon-sorting"></i></span>
                                            </div>
                                        </Accordion.Collapse>
                                    </Accordion>
                                }
                            </h4>
                            {serviceTopics && serviceTopics.length > 0 && faqData.metadata &&
                                <div className="d-flex justify-content-between align-items-center">
                                    <Dropdown className="ml-auto dropdown-customize">
                                    <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center">
                                        <i className="icon icon-filter mr-2 mb-n1"></i> <span className="d-none d-sm-inline-block">{faqData.metadata.topic === null || history.action === "PUSH" ? 'Filter by Topics' : serviceTopics.find(x => x.slug === faqData.metadata.topic).title}</span>
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {serviceTopics.length > 0 && faqData.metadata.topic && <Dropdown.Item onClick={() => urlChange(1, 'null', params.get('orderBy'))}>All</Dropdown.Item>
                                            }
                                            {
                                            serviceTopics.length > 0 && serviceTopics.map((item, index) => (
                                                item.title !== faqData.metadata.topic && <Dropdown.Item className="text-break" key={index} onClick={() => urlChange(1, item.slug, params.get('orderBy'))}>{item.title}</Dropdown.Item>
                                                ))
                                            }
                                        </Dropdown.Menu>
                                    </Dropdown>

                                    <button onClick={() => { setShow(true); setEditMode(false); setEditData(null); }} className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus"></i> <span className="d-none d-sm-inline-block pl-1">Add New FAQ</span>
                                    </button>
                                </div>
                            }
                        </div>

                        {faqData.faq && faqData.faq.length > 0 && serviceTopics && serviceTopics.length > 0 &&
                            <div className="table-responsive shadow-sm bg-white mb-3 cdp-table__responsive-wrapper">
                            <table className="table table-hover table-sm mb-0 cdp-table cdp-table__responsive">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">
                                        <tr>
                                            <th width="25%"><span className={sort.value === 'question' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, faqData.metadata.topic, 'question')}>Question<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                            <th width="35%"><span className={sort.value === 'answer' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, faqData.metadata.topic, 'answer')}>Answer<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                            <th width="22%"><span className={sort.value === 'topics' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, faqData.metadata.topic, 'topics')}>Topics<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                            <th width="10%"><span className={sort.value === 'created_by' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, faqData.metadata.topic, 'created_by')}>Created By<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                            <th width="8%">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {faqData.faq.map((row, index) => (
                                            <tr key={index}>
                                                <td data-for="Question" className="text-break">{row.question}</td>
                                                <td data-for="Answer" className="text-break cdp-link-secondary">{parse(parse(row.answer))}</td>
                                                <td data-for="Topics" className="text-break">
                                                    {row.topics && row.topics.map((item, key) => (
                                                        (serviceTopics.find(x => x.slug === item).title) + (key < row.topics.length - 1 ? ', ' : '')))}

                                                </td>
                                                <td data-for="Created By" className="text-break">{row.createdBy}</td>
                                                <td data-for="Action"><Dropdown className="ml-auto dropdown-customize">
                                                    <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1 dropdown-toggle ">
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item onClick={() => { setShow(true); setEditMode(true); setEditData(row); }}>
                                                            Edit
                                                        </Dropdown.Item>
                                                        <Dropdown.Item className="text-danger bg-white" onClick={() => { setShowDelete(true); setDeleteId(row.id); }}>Delete</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {((faqData.metadata.page === 1 &&
                                    faqData.metadata.total > faqData.metadata.limit) ||
                                    (faqData.metadata.page > 1))
                                    && faqData['faq'] &&
                                    <div className="pagination justify-content-end align-items-center border-top p-3">
                                        <span className="cdp-text-primary font-weight-bold">{faqData.metadata.start + ' - ' + faqData.metadata.end}</span> <span className="text-muted pl-1 pr-2"> {' of ' + faqData.metadata.total}</span>
                                        <span className="pagination-btn" data-testid='Prev' onClick={() => pageLeft()} disabled={faqData.metadata.page <= 1}><i className="icon icon-arrow-down ml-2 prev"></i></span>
                                        <span className="pagination-btn" data-testid='Next' onClick={() => pageRight()} disabled={faqData.metadata.end === faqData.metadata.total}><i className="icon icon-arrow-down ml-2 next"></i></span>
                                    </div>
                                }
                            </div>
                        }

                        {faqData.faq && faqData.faq.length === 0 &&
                            <div className="row justify-content-center mt-5 pt-5 mb-3">
                                <div className="col-12 col-sm-6 py-4 bg-white shadow-sm rounded text-center">
                                    <i class="icon icon-help icon-6x cdp-text-secondary"></i>
                                    <h3 className="font-weight-bold cdp-text-primary pt-4">No FAQ Found!</h3>
                                    <h4 className="cdp-text-primary pt-3 pb-5">Click on the button below to create new one</h4>
                                    <button onClick={() => { setShow(true); setEditMode(false); setEditData(null); }} className="btn cdp-btn-secondary text-white px-5 py-2 font-weight-bold">
                                        <i className="icon icon-plus pr-1"></i> Add New FAQ
                                            </button>
                                </div>
                            </div>
                        }

                        <FaqForm editMode={editMode} editData={editData} serviceTopics={serviceTopics} changeShow={(val) => setShow(val)} show={show} />

                        <Modal centered show={showDelete} onHide={() => setShowDelete(false)}>
                            <Modal.Header closeButton>
                                <Modal.Title className="modal-title_small">Remove FAQ</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <div>Are you sure you want to remove this?</div>
                            </Modal.Body>
                            <Modal.Footer>
                                <button className="btn cdp-btn-outline-primary" onClick={() => setShowDelete(false)}>Cancel</button>
                                <button className="ml-2 btn cdp-btn-secondary text-white" onClick={() => deleteFaq()}>Confirm</button>
                            </Modal.Footer>
                        </Modal>
                    </div>
                </div>
            </div>
        </main>
    );
}
