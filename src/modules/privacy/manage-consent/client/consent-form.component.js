import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Form, Formik, Field, ErrorMessage, getIn } from 'formik';
import Modal from 'react-bootstrap/Modal'
import { useToasts } from 'react-toast-notifications';
import parse from 'html-react-parser';
import Dropdown from 'react-bootstrap/Dropdown';
import CountryCodes from 'country-codes-list';

import { createConsent, updateConsent } from './consent.actions';
import { consentSchema } from './consent.schema';
import DraftEditor from '../../../core/client/components/draft-editor';
import Faq from '../../../platform/faq/client/faq.component';

const ValidationError = ({ name }) => (
    <Field name={name} >
        {({ form }) => {
            const error = getIn(form.errors, name);
            const touch = getIn(form.touched, name);
            return <div className="invalid-feedback">{touch && error ? error : null}</div>
        }}
    </Field>
);

const ConsentForm = (props) => {
    const CountryCodesObject = Object.values(CountryCodes.customList('countryCode', '{countryCode} {officialLanguageCode} {officialLanguageNameEn}'));
    const { addToast } = useToasts();
    const dispatch = useDispatch();
    const [consent, setConsent] = useState({});
    const [consentId, setConsentId] = useState();
    const [categories, setCategories] = useState([]);
    const [countryLanguages, setCountryLanguages] = useState([]);

    const [translationToDelete, setTranslationToDelete] = useState(null);
    const [showFaq, setShowFaq] = useState(false);
    const [localizations, setLocalizations] = useState([]);
    const formikRef = useRef();

    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);

    const legalBasisList = [
        { id: 'consent', value: 'Consent' },
        { id: 'contract', value: 'Contract' }
    ];

    const handleTranslationChange = (value, index, property, formikProps) => {
        const { translations } = formikProps.values;
        const updatedTranslations = [...translations];
        updatedTranslations[index][property] = value;
        formikProps.setFieldValue('translations', updatedTranslations);
    }

    const addNewTranslation = (formikProps) => {
        const newTranslations = [...formikProps.values.translations, { id: Math.random(), locale: '', rich_text: '' }];
        formikProps.setFieldValue('translations', newTranslations);

        setTimeout(() => {
            const lastTranslation = document.getElementById(`translation-${formikProps.values.translations.length + 1}`);
            lastTranslation.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    }

    const removeTranslation = (idx) => {
        const newTranslations = [...formikRef.current.values.translations];
        newTranslations.splice(idx, 1);
        formikRef.current.setFieldValue('translations', newTranslations);
        setTranslationToDelete(null);
    }

    const showRemoveTranslationModal = (index) => {
        setTranslationToDelete(index);
    };

    useEffect(() => {
        const { id } = props ? props.match ? props.match.params : '' : '';
        async function getLocalizations() {
            const { data } = await axios.get('/api/localizations');
            setLocalizations(data);
        }
        async function getConsent() {
            const response = await axios.get(`/api/cdp-consents/${id}`);
            setConsentId(id);
            setConsent(response.data);
        }
        async function getConsentCatogories() {
            const response = await axios.get('/api/privacy/consent-categories');
            setCategories(response.data);
        }
        function getLanguages() {
            const mapped_languages = {};

            const country_languages = CountryCodesObject.filter(item => {
                const [, , language_name] = item.split(' ');
                if (language_name && !mapped_languages[language_name]) {
                    mapped_languages[language_name] = true;
                    return true;
                }
                return false;
            });
            country_languages.sort((a, b) => {
                const [, , language_name1] = a.split(' ');
                const [, , language_name2] = b.split(' ');
                if (language_name1.replace(/,/g, '') < language_name2.replace(/,/g, '')) return -1;
                return 1;
            });
            setCountryLanguages(country_languages);
        }

        if (id) getConsent();
        getConsentCatogories();
        getLanguages();
        getLocalizations();
    }, [props]);

    const getTranslations = (formikProps) => {
        const { translations } = formikProps.values;

        return translations.map((item, idx) => {
            const translationId = `translation-${idx + 1}`;
            const localeId = `locale-${idx}`;
            const richTextId = `rich-text-${idx}`;

            return (<React.Fragment key={item.id}>
                <div className="col-12" id={translationId}>
                    <div className="row border border-primary rounded pb-3 mb-3 mx-0 shadow-sm">
                        <label className="col-12 font-weight-bold d-flex justify-content-between align-items-center bg-light py-2 border-bottom rounded-top">
                            {formikProps?.values?.preference}
                            <i className="fas fa-minus-circle text-danger fa-2x hover-opacity ml-auto cursor-pointer" title="Remove" onClick={() => showRemoveTranslationModal(idx)}></i>
                        </label>
                        <div className="col-12 col-sm-6">
                            <div className="form-group">
                                <label className="font-weight-bold" htmlFor={localeId}>Localization <span className="text-danger">*</span></label>
                                <Field className="form-control locale" value={item.locale} onChange={(e) => handleTranslationChange(e.target.value, idx, 'locale', formikProps)} data-id={idx} as="select" name={localeId} id={localeId}>
                                    <option key={'country-' + item.id} value="" disabled>--Select Localization--</option>
                                    {localizations.filter(l => l.country_iso2).map(localization => {
                                        return <option key={localization.locale} value={localization.locale}>
                                            {localization.language_variant} ({localization.locale})
                                        </option>
                                    })}
                                </Field>
                                <ValidationError name={`translations[${idx}].locale`} />
                            </div>
                        </div>

                        <div className="col-12">
                            <div className="form-group">
                                <label className="font-weight-bold" htmlFor={richTextId}>Rich Text <span className="text-danger">*</span></label>
                                <div className="border rounded draft-editor">
                                    <DraftEditor htmlContent={item.rich_text} onChangeHTML={(html, { plainText, cleanupEmptyHtmlTags }) => {
                                        const rich_text = cleanupEmptyHtmlTags(html);
                                        handleTranslationChange(rich_text, idx, 'rich_text', formikProps);
                                    }}/>
                                </div>
                                <ValidationError name={`translations[${idx}].rich_text`} />
                            </div>
                        </div>
                    </div>
                </div>

            </React.Fragment>
            )
        });
    };

    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="w-100">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12 px-0">
                            <nav className="breadcrumb justify-content-between align-items-center" aria-label="breadcrumb">
                                <ol className="rounded-0 m-0 p-0 d-none d-sm-flex">
                                    <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                    <li className="breadcrumb-item"><NavLink to="/consent/">Data Privacy & Consent Management</NavLink></li>
                                    <li className="breadcrumb-item"><NavLink to="/consent/list">CDP Consents</NavLink></li>
                                    <li className="breadcrumb-item active"><span>{consentId ? 'Edit Consent' : 'Add new Consent'}</span></li>
                                </ol>
                                <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                    <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                        <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                        <Dropdown.Item className="px-2" href="/consent"><i className="fas fa-link mr-2"></i> Data Privacy & Consent Management</Dropdown.Item>
                                        <Dropdown.Item className="px-2" href="/consent/list"><i className="fas fa-link mr-2"></i> CDP Consents</Dropdown.Item>
                                        <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> {consentId ? 'Edit Consent' : 'Add new Consent'}</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                                <span className="ml-auto mr-3"><i onClick={handleShowFaq} className="icon icon-help breadcrumb__faq-icon cdp-text-secondary cursor-pointer"></i></span>
                            </nav>
                            <Modal show={showFaq} onHide={handleCloseFaq} size="lg" centered>
                                <Modal.Header closeButton>
                                    <Modal.Title>Questions You May Have</Modal.Title>
                                </Modal.Header>
                                <Modal.Body className="faq__in-modal"><Faq topic="manage-consent" /></Modal.Body>
                            </Modal>
                        </div>
                    </div>
                </div>
                <div className="container">
                    {categories && countryLanguages && categories.length > 0 && countryLanguages.length > 0 && ((consentId && Object.keys(consent).length) || (!consentId)) &&
                        <div className="row">
                            <div className="col-12">
                                <div className="shadow-sm bg-white mb-3">
                                    <h2 className="d-flex align-items-center p-3 px-sm-4 py-sm-2 page-title light">
                                        <span className="page-title__text font-weight-bold py-3">{consentId ? 'Edit Consent' : 'Create New Consent'}</span>
                                    </h2>
                                    <div className="add-user p-3">
                                        <Formik
                                            initialValues={{
                                                category_id: consentId && Object.keys(consent).length && consent.consent_category
                                                    ? consent.consent_category.id
                                                    : '',
                                                legal_basis: consentId && Object.keys(consent).length ? consent.legal_basis : '',
                                                preference: consentId && Object.keys(consent).length ? consent.preference : '',
                                                translations: consentId && Object.keys(consent).length ? consent.translations : [],
                                                is_active: consentId && Object.keys(consent).length ? consent.is_active : true
                                            }}
                                            displayName="ConsentForm"
                                            validationSchema={consentSchema}
                                            innerRef={formikRef}
                                            onSubmit={(values, actions) => {
                                                const uniqueTranslations = new Set(values.translations.map(t => t.locale.toLowerCase()));

                                                if (uniqueTranslations.size < values.translations.length) {
                                                    addToast('Please remove duplicate translations.', {
                                                        appearance: 'error',
                                                        autoDismiss: true
                                                    });
                                                    actions.setSubmitting(false);
                                                    return;
                                                }

                                                if (consentId) {
                                                    dispatch(updateConsent(values, consentId))
                                                        .then(res => {
                                                            const updatedTranslations = res.value.data.translations;
                                                            const newTranslations = values.translations.map((tr, ind) => {
                                                                tr.id = updatedTranslations[ind].id;
                                                                return tr;
                                                            });

                                                            actions.setFieldValue('translations', newTranslations);
                                                            addToast('Consent updated successfully', {
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
                                                }
                                                else {
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
                                                }
                                            }}
                                        >
                                            {formikProps => (
                                                <Form onSubmit={formikProps.handleSubmit}>
                                                    <div className="row">
                                                        <div className="col-12">
                                                            <div className="row">

                                                                <div className="col-12">
                                                                    <div className="form-group">
                                                                        <label className="font-weight-bold" htmlFor='preference'> Preference <span className="text-danger">*</span></label>
                                                                        <Field className="form-control preference" type='text' name='preference' id='preference' />
                                                                        <div className="invalid-feedback"><ErrorMessage name='preference' /></div>
                                                                    </div>
                                                                </div>

                                                                <div className="col-12 col-sm-6">
                                                                    <div className="form-group">
                                                                        <label className="font-weight-bold" htmlFor="category_id">Category <span className="text-danger">*</span></label>
                                                                        <Field data-testid="category_id" as="select" name="category_id" className="form-control">
                                                                            <option key="select-category" value="" disabled>--Select Category--</option>
                                                                            {categories.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
                                                                        </Field>
                                                                        <div className="invalid-feedback"><ErrorMessage name="category_id" /></div>
                                                                    </div>
                                                                </div>

                                                                <div className="col-12 col-sm-6">
                                                                    <div className="form-group">
                                                                        <label className="font-weight-bold" htmlFor="category_id">Legal Basis <span className="text-danger">*</span></label>
                                                                        <Field data-testid="legal_basis" as="select" name="legal_basis" className="form-control text-capitalize">
                                                                            <option key="select-legal-basis" value="" disabled>--Select Legal Basis--</option>
                                                                            {legalBasisList.map(item => <option key={item.id} value={item.id}>{item.value}</option>)}
                                                                        </Field>
                                                                        <div className="invalid-feedback"><ErrorMessage name="legal_basis" /></div>
                                                                    </div>
                                                                </div>

                                                                <div className="col-12 col-sm-6 py-3">
                                                                    <div className="form-group">
                                                                        <label className="d-flex justify-content-between align-items-center">
                                                                            <span className="switch-label font-weight-bold"> Active Status </span>
                                                                            <span className="switch">
                                                                                <Field
                                                                                    name="is_active"
                                                                                    type="checkbox"
                                                                                    checked={formikProps.values.is_active}
                                                                                />
                                                                                <span className="slider round"></span>
                                                                            </span>
                                                                        </label>
                                                                    </div>
                                                                </div>

                                                                {getTranslations(formikProps)}

                                                                <div className="col-12">
                                                                    <div className="form-group">
                                                                    <label className="d-flex align-items-center cdp-text-primary hover-opacity cursor-pointer" onClick={() => addNewTranslation(formikProps)}>
                                                                            <i className="fas fa-plus  fa-2x mr-3" ></i>
                                                                            <span className="h4 mb-0">Add Localizations</span>
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
            </div>


            <Modal centered show={translationToDelete !== null} onHide={() => setTranslationToDelete(null)}>
                <Modal.Header closeButton>
                    <Modal.Title className="modal-title_small">Remove Localization</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {translationToDelete !== null && formikRef.current.values.translations[translationToDelete] ? (
                        <div>
                            Are you sure you want to remove the following localization?
                            <div className="alert alert-info my-3">
                                {parse(formikRef.current.values.translations[translationToDelete].rich_text)}
                            </div>
                        </div>
                    ) : null}
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn cdp-btn-outline-primary" onClick={() => setTranslationToDelete(null)}>Cancel</button>
                    <button className="ml-2 btn cdp-btn-secondary text-white" onClick={() => removeTranslation(translationToDelete)}>Confirm</button>
                </Modal.Footer>
            </Modal>


        </main>
    );
}

export default ConsentForm;
