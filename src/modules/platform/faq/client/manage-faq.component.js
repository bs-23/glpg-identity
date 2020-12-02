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

export default function ManageFaq() {
    const [show, setShow] = useState(false);
    const faqData = useSelector(state => state.faqReducer.faq_items);
    const serviceCategories = useSelector(state => state.faqReducer.faq_categories);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState(null);
    const [category, setCategory] = useState(null);
    const [sort, setSort] = useState({ type: 'asc', value: null });
    const [showDelete, setShowDelete] = useState(false);
    const [deleteId, setDeleteId] = useState(false);
    const { addToast } = useToasts();
    const dispatch = useDispatch();
    const location = useLocation();
    const history = useHistory();
    const params = new URLSearchParams(window.location.search);

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
        const category = faqCategory ? encodeURIComponent(faqCategory) : encodeURIComponent(params.get('category'));

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
            + (category && category !== 'null' ? `&category=${category}` : '')
            + (orderColumn && orderColumn !== 'null' ? `&orderBy=${orderColumn}` : '')
            + (orderColumn && orderType && orderType !== 'null' ? `&orderType=${orderType}` : '');

        history.push(location.pathname + url);

    }

    useEffect(() => {
        setCategory(params.get('category') ? params.get('category') : null);
        const searchObj = {};
        const searchParams = location.search.slice(1).split("&");
        searchParams.forEach(element => {
            searchObj[element.split("=")[0]] = element.split("=")[1];
        });
        dispatch(getFaqItems(searchObj.page, searchObj.category, searchObj.orderBy, searchObj.orderType));
        setSort({ type: params.get('orderType') || 'asc', value: params.get('orderBy') });
    }, [location]);

    const pageLeft = () => {
        if (faqData.metadata.page > 1) urlChange(faqData.metadata.page - 1, faqData.metadata.category, params.get('orderBy'), true);
    };

    const pageRight = () => {
        if (faqData.metadata.end !== faqData.metadata.total) urlChange(faqData.metadata.page + 1, faqData.metadata.category, params.get('orderBy'), true);
    };


    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/users">Management of Customer Data platform</NavLink></li>
                                <li className="breadcrumb-item active"><span>FAQ</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="d-sm-flex justify-content-between align-items-center mb-3 mt-4">
                            <h4 class="cdp-text-primary font-weight-bold mb-3 mb-sm-0">FAQ List</h4>
                            {serviceCategories.length > 0 && faqData.metadata &&
                                < div class="d-flex justify-content-between align-items-center">
                                    <Dropdown className="ml-auto dropdown-customize">
                                        <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center">
                                            <i className="icon icon-filter mr-2 mb-n1"></i> {!faqData.metadata.category ? 'Filter by Category' : serviceCategories.find(x => x.slug === faqData.metadata.category).title}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {
                                                faqData.metadata.category && <Dropdown.Item onClick={() => urlChange(1, 'null', params.get('orderBy'))}>All</Dropdown.Item>
                                            }
                                            {
                                                serviceCategories.length > 0 && serviceCategories.map((item, index) => (
                                                    item.title !== faqData.metadata.category && <Dropdown.Item key={index} onClick={() => urlChange(1, item.slug, params.get('orderBy'))}>{item.title}</Dropdown.Item>
                                                ))
                                            }
                                        </Dropdown.Menu>
                                    </Dropdown>

                                    <button onClick={() => { setShow(true); setEditMode(false); setEditData(null); }} className="btn cdp-btn-secondary text-white ml-2">
                                        <i className="icon icon-plus pr-1"></i> Add New FAQ
                                </button>
                                </div>
                            }
                        </div>

                        {faqData.faq && faqData.faq.length > 0 && serviceCategories && serviceCategories.length > 0 &&
                            <div className="table-responsive shadow-sm bg-white">
                                <table className="table table-hover table-sm mb-0 cdp-table">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">

                                        <tr>
                                            <th width="25%"><span className={sort.value === 'question' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, faqData.metadata.category, 'question')}>Question<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                            <th width="35%"><span className={sort.value === 'answer' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, faqData.metadata.category, 'answer')}>Answer<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                            <th width="22%"><span className={sort.value === 'categories' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, faqData.metadata.category, 'categories')}>Category<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                            <th width="10%"><span className={sort.value === 'created_by' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, faqData.metadata.category, 'created_by')}>Created By<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                            <th width="8%">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {faqData.faq.map((row, index) => (
                                            <tr key={index}>
                                                <td className="text-break">{row.question}</td>
                                                <td className="text-break">{parse(row.answer)}</td>
                                                <td className="text-break">{row.categories && row.categories.map((item, key) => (
                                                    (serviceCategories.find(x => x.slug === item).title) + (key < row.categories.length - 1 ? ', ' : '')

                                                ))
                                                }</td>
                                                <td className="text-break">{row.createdBy}</td>
                                                <td><Dropdown className="ml-auto dropdown-customize">
                                                    <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1 dropdown-toggle ">
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item onClick={() => { setShow(true); setEditMode(true); setEditData(row); }}>
                                                            Edit
                                                        </Dropdown.Item>
                                                        <Dropdown.Item className="text-danger" onClick={() => { setShowDelete(true); setDeleteId(row.id); }}>Delete</Dropdown.Item>
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
                                    <div className="pagination justify-content-end align-items-center border-top p-3">.
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
                        <FaqForm editMode={editMode} editData={editData} serviceCategory={serviceCategories} changeShow={(val) => setShow(val)} show={show} />
                        <Modal centered show={showDelete} onHide={() => setShowDelete(false)}>
                            <Modal.Header closeButton>
                                <Modal.Title className="modal-title_small">Remove FAQ</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <div>
                                    Are you sure you want to remove this FAQ?
                                    </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <button className="btn cdp-btn-outline-primary" onClick={() => setShowDelete(false)}>Cancel</button>
                                <button className="ml-2 btn cdp-btn-secondary text-white" onClick={() => deleteFaq()}>Confirm</button>
                            </Modal.Footer>
                        </Modal>
                    </div>
                </div>
            </div>
        </main >

    );
}
