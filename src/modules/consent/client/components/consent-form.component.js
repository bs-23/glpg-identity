import axios from "axios";
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Form, Formik, Field, FieldArray, ErrorMessage } from "formik";
import { createConsent } from "../consent.action";
import { useToasts } from "react-toast-notifications";

const ConsentForm = () => {
    const { addToast } = useToasts();
    const [categories, setCategories] = useState([]);
    const [isActive, setIsActive] = useState(true);
    const [translations, setTranslations] = useState([{ country: '', language: '' , rich_text: '', locale: '' }]);

    const handleChange = (e) => {
        const newTranslations = [...translations];
        const field = e.target.className.split(' ');
        const translation = newTranslations[e.target.dataset.id];
        translation[field[1]] = e.target.value;
        if(field[1] === 'country' || field[1] === 'language') translation['locale'] = `${translation['country']}_${translation['language']}`;
        setTranslations(newTranslations);
    }

    const addNewTranslation = () => {
        const newTranslations = [...translations, { country: '', language: '' , rich_text: '', locale: '' }];
        setTranslations(newTranslations);
    }

    const removeTranslation = (idx) => {
        const newTranslations = [...translations];
        newTranslations.splice(idx, 1);
        setTranslations(newTranslations);
    }

    const getTranslations = () => {
        const lastTranslation = translations.length;

        return translations.map((item, idx) => {
            const translationId = `Translation-${idx+1}`;
            const countryId = `country-${idx}`;
            const languageId = `language-${idx}`;
            const richTextId = `rich-text-${idx}`;

            return (<React.Fragment key={idx}>
                <label className="col-12 col-sm-10 font-weight-bold">{translationId}</label>
                <div className="col-12 col-sm-6">
                    <div className="form-group">
                        <label className="font-weight-bold" htmlFor={countryId}> Country </label>
                        <Field className="form-control country" value={item.country} onChange={(e) => handleChange(e)} type='text' data-id={idx} name={countryId} id={countryId}/>
                        <div className="invalid-feedback"><ErrorMessage name={countryId} /></div>
                    </div>
                </div>

                <div className="col-12 col-sm-6">
                    <div className="form-group">
                        <label className="font-weight-bold" htmlFor={languageId}> Language </label>
                        <Field className="form-control language" value={item.language} onChange={(e) => handleChange(e)} type='text' data-id={idx} name={languageId} id={languageId}/>
                        <div className="invalid-feedback"><ErrorMessage name={languageId} /></div>
                    </div>
                </div>

                <div className="col-12 col-sm-6">
                    <div className="form-group">
                        <label className="font-weight-bold" htmlFor={richTextId}> Rich Text </label>
                        <Field className="form-control rich_text" value={item.rich_text} onChange={(e) => handleChange(e)} type='text' data-id={idx} name={richTextId} id={richTextId}/>
                        <div className="invalid-feedback"><ErrorMessage name={richTextId} /></div>
                    </div>
                </div>
                {idx < lastTranslation-1 && <div className="col-12 col-sm-6">
                    <div className="form-group">
                        <label className="d-flex justify-content-between align-items-center">
                            <span>Remove translations</span>
                            <span className="pl-3 pt-2 pr-3 pb-2 border border-danger rounded" onClick={() => removeTranslation(idx)}>
                                -
                            </span>
                        </label>
                    </div>
                </div>}
            </React.Fragment>
        )});
    };

    useEffect(() => {
        async function getConsentCatogories() {
            const response = await axios.get('/api/consent/category');
            setCategories(response.data);
        }
        getConsentCatogories();
    }, []);

    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/consent/">Data Privacy & Consent Management</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/consent/list">CDP Consents List</NavLink></li>
                                <li className="breadcrumb-item active"><span>Add new Consent</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                {categories.length > 0 &&
                    <div className="row">
                        <div className="col-12">
                            <div className="shadow-sm bg-white mb-3">
                                <h2 className="d-flex align-items-center p-3 px-sm-4 py-sm-2 page-title light">
                                    <span className="page-title__text font-weight-bold py-3">Create New Consent</span>
                                </h2>
                                <div className="add-user p-3">
                                    <Formik
                                        initialValues={{
                                            category_id: categories[0].id,
                                            legal_basis: "consent",
                                            title: "",
                                            preference: "",
                                            translations: [],
                                            is_active: isActive
                                        }}
                                        displayName="ConsentForm"
                                        onSubmit={(values, actions) => {
                                            values.translations = translations;
                                            console.log(values)

                                            dispatch(createConsent(values))
                                                .then(res => {
                                                    actions.resetForm();
                                                    addToast('Consent created successfully', {
                                                        appearance: 'success',
                                                        autoDismiss: true
                                                    });
                                                }).catch(err => {
                                                    const errorMessage = typeof err.response.data === 'string' ? err.response.data : err.response.statusText
                                                    addToast(errorMessage, {
                                                        appearance: 'error',
                                                        autoDismiss: true
                                                    });
                                                });

                                            actions.setSubmitting(false);
                                        }}
                                    >
                                        {formikProps => (
                                            <Form onSubmit={formikProps.handleSubmit}>
                                                <div className="row">
                                                    <div className="col-12 col-lg-8 col-xl-6">
                                                        <div className="row">
                                                            <div className="col-12 col-sm-6">
                                                                <div className="form-group">
                                                                    <label className="font-weight-bold" htmlFor="category_id">Select Category <span className="text-danger">*</span></label>
                                                                    <Field data-testid="category" as="select" name="category_id" className="form-control">
                                                                        {categories.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
                                                                    </Field>
                                                                </div>
                                                            </div>

                                                            <div className="col-12 col-sm-6">
                                                                <div className="form-group">
                                                                    <label className="font-weight-bold" htmlFor="category_id">Select Legal Basis <span className="text-danger">*</span></label>
                                                                    <Field data-testid="legal_basis" as="select" name="legal_basis" className="form-control text-capitalize">
                                                                        {['consent', 'contract'].map(item => <option key={item} value={item}>{item}</option>)}
                                                                    </Field>
                                                                </div>
                                                            </div>

                                                            <div className="col-12 col-sm-6">
                                                                <div className="form-group">
                                                                    <label className="font-weight-bold" htmlFor="title"> Title <span className="text-danger">*</span></label>
                                                                    <Field className="form-control" type="name" name="title" />
                                                                    <div className="invalid-feedback"><ErrorMessage name="title" /></div>
                                                                </div>
                                                            </div>

                                                            <div className="col-12 col-sm-6">
                                                                <div className="form-group">
                                                                    <label className="font-weight-bold" htmlFor="preference"> Preference <span className="text-danger">*</span></label>
                                                                    <Field className="form-control" type="preference" name="preference" />
                                                                    <div className="invalid-feedback"><ErrorMessage name="preference" /></div>
                                                                </div>
                                                            </div>

                                                            {getTranslations()}

                                                            <div className="col-12 col-sm-7">
                                                                <div className="form-group">
                                                                    <label className="d-flex justify-content-between align-items-center">
                                                                        <span> Add more translations</span>
                                                                        <span className="pl-3 pt-2 pr-3 pb-2 border border-primary rounded" onClick={addNewTranslation}>
                                                                            +
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            <div className="col-12 col-sm-6">
                                                                <div className="form-group">
                                                                    <label className="d-flex justify-content-between align-items-center">
                                                                        <span className="switch-label"> Status </span>
                                                                        <span className="switch">
                                                                            <input
                                                                                name="is_active"
                                                                                type="checkbox"
                                                                                value={isActive}
                                                                                checked={isActive}
                                                                                onChange={() => setIsActive(!isActive)}
                                                                            />
                                                                            <span className="slider round"></span>
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                        </div>
                                                        <button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" >Submit</button>
                                                    </div>
                                                </div>
                                            </Form>
                                        )}
                                    </Formik>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>

        </main>
    );
}

export default ConsentForm;
