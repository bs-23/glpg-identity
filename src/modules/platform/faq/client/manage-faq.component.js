import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import FaqForm from './faq-form.component';
import axios from "axios";
import { getFaqItems } from './faq.actions';
import { useSelector, useDispatch } from 'react-redux';

export default function ManageFaq() {
    const [show, setShow] = useState(false);
    const faqData = useSelector(state => state.faqReducer.faq_items);
    const [serviceCategory, setServiceCategory] = useState(false);


    useEffect(() => {

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
                        <div className="d-sm-flex justify-content-end align-items-center mb-3 mt-4">
                            <div class="d-flex justify-content-between align-items-center">
                                <button onClick={() => setShow(true)} className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus pr-1"></i> Add New FAQ
                                </button>
                                <FaqForm serviceCategory={serviceCategory} changeShow={(val) => setShow(val)} show={show} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

    );
}
