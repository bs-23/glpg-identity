import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Formik, Field, FieldArray, ErrorMessage } from 'formik';
import Modal from 'react-bootstrap/Modal'
import { useToasts } from 'react-toast-notifications';
import parse from 'html-react-parser';
import { createConsent, updateConsent } from '../consent.actions';
import CountryCodes from 'country-codes-list';
import { consentSchema } from '../consent.schema';
import DraftEditor from '../../../core/client/components/draft-editor';

const ConsentForm = (props) => {
    const CountryCodesObject = Object.values(CountryCodes.customList('countryCode', '{countryCode} {officialLanguageCode} {officialLanguageNameEn}'));
    const { addToast } = useToasts();
    const dispatch = useDispatch();
    const [consent, setConsent] = useState({});
    const [consentId, setConsentId] = useState();
    const [categories, setCategories] = useState([]);
    const [userCountries, setUserCountries] = useState([]);
    const [countryLanguages, setCountryLanguages] = useState([]);
    const [isActive, setIsActive] = useState(true);
    const [translations, setTranslations] = useState([]);
    const [translationToDelete, setTranslationToDelete] = useState(null);
    const [showError, setShowError] = useState(false);
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);
    const countries = useSelector(state => state.countryReducer.countries);

    const legalBasisList = [
        { id: 'consent', value: 'Consent' },
        { id: 'contract', value: 'Contract' }
    ];

    const handleChange = (e) => {
        const newTranslations = [...translations];
        const field = e.target.className.split(' ');
        const translation = newTranslations[e.target.dataset.id];
        translation[field[1]] = e.target.value;
        setTranslations(newTranslations);
    }

    const addNewTranslation = () => {
        const newTranslations = [...translations, { id: Math.random(), country_iso2: '', lang_code: '', rich_text: '' }];
        setTranslations(newTranslations);
        setShowError(false);
        setTimeout(() => {
            const lastTranslation = document.getElementById(`translation-${translations.length + 1}`);
            lastTranslation.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    }

    const removeTranslation = (idx) => {
        const newTranslations = [...translations];
        newTranslations.splice(idx, 1);
        setTranslations(newTranslations);
        setTranslationToDelete(null);
    }

    const showRemoveTranslationModal = (index) => {
        setTranslationToDelete(index);
    };

    const fetchUserCountries = (userCountries, allCountries) => userCountries.map(element => allCountries.find(x => x.country_iso2 == element)).filter(element => element);

    const resetForm = () => {
        setTranslations([]);
        setIsActive(true);
    }

    useEffect(() => {
        const { id } = props ? props.match ? props.match.params : '' : '';

        async function getConsent() {
            const response = await axios.get(`/api/cdp-consents/${id}`);
            setConsentId(id);
            setConsent(response.data);
            setTranslations(response.data.translations.map(i => ({ ...i, country_iso2: i.locale.split('_')[1], lang_code: i.locale.split('_')[0] })));
            setIsActive(response.data.is_active);
        }
        async function getConsentCatogories() {
            const response = await axios.get('/api/privacy/consent-categories');
            setCategories(response.data);
        }
        async function getCountries() {
            setUserCountries(fetchUserCountries(loggedInUser.countries, countries));
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
        getCountries();
        getLanguages();
    }, [props]);

    const getTranslations = (formikProps) => {
        return translations.map((item, idx) => {
            const translationId = `translation-${idx + 1}`;
            const countryId = `country-${idx}`;
            const languageId = `language-${idx}`;
            const richTextId = `rich-text-${idx}`;

            return (<React.Fragment key={item.id}>
                <div className="col-12" id={translationId}>
                    <div className="row border border-primary rounded pb-3 mb-3 mx-0 shadow-sm">
                        <label className="col-12 font-weight-bold d-flex justify-content-between align-items-center bg-light py-2 border-bottom rounded-top">
                            {formikProps?.values?.preference}
                            <i className="fas fa-minus-circle text-danger fa-2x hover-opacity ml-auto" type="button" title="Remove" onClick={() => showRemoveTranslationModal(idx)}></i>
                        </label>
                        <div className="col-12 col-sm-6">
                            <div className="form-group">
                                <label className="font-weight-bold" htmlFor={countryId}>Country <span className="text-danger">*</span></label>
                                <Field className="form-control country_iso2" value={item.country_iso2.toLowerCase()} onChange={(e) => handleChange(e)} data-id={idx} as="select" name={countryId} id={countryId}>
                                    <option key={'country-' + item.id} value="" disabled>--Select Country--</option>
                                    {userCountries.map(element => <option key={element.countryid} value={element.country_iso2.toLowerCase()}>{element.codbase_desc}</option>)}
                                </Field>
                                {showError && !item.country_iso2 && <div class="invalid-feedback">This field must not be empty.</div>}
                            </div>
                        </div>

                        <div className="col-12 col-sm-6">
                            <div className="form-group">
                                <label className="font-weight-bold" htmlFor={languageId}>Language <span className="text-danger">*</span></label>
                                <Field className="form-control lang_code" value={item.lang_code} onChange={(e) => handleChange(e)} data-id={idx} as="select" name={languageId} id={languageId}>
                                    <option key={'language-' + item.id} value="" disabled>--Select Language--</option>
                                    {countryLanguages.map(element => {
                                        const [country_iso2, language_code, language_name] = element.split(' ');
                                        return language_name && <option key={country_iso2} value={language_code}>{language_name.replace(/,/g, '')}</option>
                                    })}
                                </Field>
                                {showError && !item.lang_code && <div class="invalid-feedback">This field must not be empty.</div>}
                            </div>
                        </div>

                        <div className="col-12">
                            <div className="form-group">
                                <label className="font-weight-bold" htmlFor={richTextId}>Rich Text <span className="text-danger">*</span></label>
                                <div className="border rounded draft-editor">
                                    <DraftEditor htmlContent={item.rich_text} onChangeHTML={(html) => {
                                        if (item.rich_text.length > 976) setShowError(true);
                                        else setShowError(false);
                                        handleChange({
                                            target: {
                                                value: html,
                                                className: "form-control rich_text",
                                                dataset: {
                                                    id: idx
                                                }
                                            }
                                        });
                                    }}


                                    />
                                </div>
                                {showError && item.rich_text === '<p><br></p>' && <div class="invalid-feedback">This field must not be empty.</div>}
                                {showError && item.rich_text.length > 976 && <div class="invalid-feedback">Maximum character limit has been exceeded.</div>}
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
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb rounded-0">
                                    <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                    <li className="breadcrumb-item"><NavLink to="/consent/">Data Privacy & Consent Management</NavLink></li>
                                    <li className="breadcrumb-item"><NavLink to="/consent/list">CDP Consents</NavLink></li>
                                    <li className="breadcrumb-item active"><span>{consentId ? 'Edit Consent' : 'Add new Consent'}</span></li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
                <div className="container">
                    {categories && userCountries && countryLanguages && categories.length > 0 && userCountries.length > 0 && countryLanguages.length > 0 && ((consentId && Object.keys(consent).length) || (!consentId)) &&
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
                                                is_active: consentId && Object.keys(consent).length ? consent.is_active : isActive
                                            }}
                                            displayName="ConsentForm"
                                            validationSchema={consentSchema}
                                            onSubmit={(values, actions) => {
                                                values.is_active = isActive;

                                                const validTranslations = translations.filter(item => item.country_iso2 && item.lang_code && item.rich_text && item.rich_text !== '<p><br></p>');
                                                if (translations.length !== validTranslations.length) {
                                                    setShowError(true);
                                                    return;
                                                }

                                                if (!validTranslations || !validTranslations.length) {
                                                    addToast('Please provide at least one translation', {
                                                        appearance: 'error',
                                                        autoDismiss: true
                                                    });
                                                    actions.setSubmitting(false);
                                                    return;
                                                } else {
                                                    const uniqueTranslations = new Set(validTranslations.map(t => t.country_iso2.toLowerCase() + t.lang_code.toLowerCase()));
                                                    if (uniqueTranslations.size < validTranslations.length) {
                                                        addToast('Please remove duplicate translations.', {
                                                            appearance: 'error',
                                                            autoDismiss: true
                                                        });
                                                        actions.setSubmitting(false);
                                                        return;
                                                    }
                                                }

                                                values.translations = validTranslations;

                                                if (consentId) {
                                                    dispatch(updateConsent(values, consentId))
                                                        .then(res => {
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
                                                            resetForm();
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

                                                                {getTranslations(formikProps)}

                                                                <div className="col-12">
                                                                    <div className="form-group">
                                                                        <label className="d-flex align-items-center cdp-text-primary hover-opacity" type="button" onClick={addNewTranslation}>
                                                                            <i className="fas fa-plus  fa-2x mr-3" ></i>
                                                                            <span className="h4 mb-0">Add Localizations</span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button type="submit" disabled={showError} className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" >Submit</button>
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
                    {translationToDelete !== null && translations[translationToDelete] ? (
                        <div>
                            Are you sure you want to remove the following localization?
                            <div className="alert alert-info my-3">
                                {parse(translations[translationToDelete].rich_text)}
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
