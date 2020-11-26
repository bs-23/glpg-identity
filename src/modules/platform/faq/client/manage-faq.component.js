import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
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
    const [serviceCategory, setServiceCategory] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState(null);
    const [showDelete, setShowDelete] = useState(false);
    const [deleteId, setDeleteId] = useState(false);
    const { addToast } = useToasts();
    const dispatch = useDispatch();

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

    useEffect(() => {
        dispatch(getFaqItems());
        async function getServiceCategory() {
            const response = (await axios.get('/api/serviceCategories')).data;
            setServiceCategory(response);
        }
        getServiceCategory();
    }, []);

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
                            <div class="d-flex justify-content-between align-items-center">
                                <button onClick={() => { setShow(true); setEditMode(false); setEditData(null); }} className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus pr-1"></i> Add New FAQ
                                </button>
                            </div>
                        </div>

                        {faqData && faqData.length > 0 && serviceCategory && serviceCategory.length > 0 &&
                            <div className="table-responsive shadow-sm bg-white">
                                <table className="table table-hover table-sm mb-0 cdp-table">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">
                                    <tr>
                                        <th width="25%">Questions</th>
                                        <th width="45%">Answers</th>
                                        <th width="25%">Category</th>
                                        <th width="5%">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {faqData.map((row, index) => (
                                            <tr key={index}>
                                                <td className="text-break">{row.question}</td>
                                                <td className="text-break">{parse(row.answer)}</td>
                                                <td className="text-break">{row.service_categories && row.service_categories.map((item, key) => (
                                                    (serviceCategory.find(x => x.id === item).title) + (key < row.service_categories.length - 1 ? ',' : '')

                                                ))
                                                }</td>
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
                            </div>
                        }
                        <FaqForm editMode={editMode} editData={editData} serviceCategory={serviceCategory} changeShow={(val) => setShow(val)} show={show} />
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
        </main>

    );
}
