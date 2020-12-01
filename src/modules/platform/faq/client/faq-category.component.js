import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import FaqForm from './faq-form.component';
import axios from "axios";
import { getFaqCategories } from './faq.actions';
import { useSelector, useDispatch } from 'react-redux';
import parse from 'html-react-parser';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import { useToasts } from 'react-toast-notifications';
import FaqCategoryForm from './faq-category-form.component';

export default function FaqCategory() {

    const dispatch = useDispatch();
    const faqCategories = useSelector(state => state.faqReducer.faq_categories);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState(null);
    const [show, setShow] = useState(false);



    useEffect(() => {
        dispatch(getFaqCategories());
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
                                <li className="breadcrumb-item active"><span>FAQ Cateries</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <button onClick={() => { setShow(true); setEditMode(false); setEditData(null); }} className="btn cdp-btn-secondary text-white ml-2">
                            <i className="icon icon-plus pr-1"></i> Add New FAQ Category
                        </button>
                        {faqCategories && faqCategories.length > 0 &&
                            <div className="table-responsive shadow-sm bg-white">
                                <table className="table table-hover table-sm mb-0 cdp-table">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">

                                        <tr>
                                            <th width="25%">Title</th>
                                            <th width="45%">Slug</th>
                                            <th >Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {faqCategories.map((row, index) => (

                                            <tr key={index}>
                                                <td className="text-break">{row.title}</td>
                                                <td className="text-break">{row.slug}</td>
                                                <td><Dropdown className="ml-auto dropdown-customize">
                                                    <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1 dropdown-toggle ">
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item>
                                                            Edit
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        }
                        <FaqCategoryForm editMode={editMode} editData={editData} changeShow={(val) => setShow(val)} show={show} />
                    </div>
                </div>
            </div>
        </main>


    );
}
