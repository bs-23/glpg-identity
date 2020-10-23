import axios from "axios";
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { Form, Formik, Field, FieldArray, ErrorMessage } from "formik";
import { createConsent, updateConsent } from '../consent.actions';
import { useToasts } from "react-toast-notifications";
import CountryCodes from 'country-codes-list';
import { consentSchema } from '../consent.schema';
import DraftEdior from '../../../core/client/components/draft-editor';

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
    const [categoryId, setCategoryId] = useState([]);
    const [legalBasis, setLegalBasis] = useState([]);
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);

    const handleChange = (e) => {
        const newTranslations = [...translations];
        const field = e.target.className.split(' ');
        const translation = newTranslations[e.target.dataset.id];
        translation[field[1]] = e.target.value;
        setTranslations(newTranslations);
    }

    const addNewTranslation = () => {
        const [, lang_code, ] = countryLanguages[0].split(' ');
        const init_lang_code = lang_code.toLowerCase();
        const init_country_iso2 = userCountries[0].country_iso2.toLowerCase();
        const newTranslations = [...translations, { country_iso2: init_country_iso2, lang_code: init_lang_code , rich_text: '' }];
        setTranslations(newTranslations);
    }

    const removeTranslation = (idx) => {
        const newTranslations = [...translations];
        newTranslations.splice(idx, 1);
        setTranslations(newTranslations);
    }

    const fetchUserCountries = (userCountries, allCountries) => userCountries.map(element => allCountries.find(x => x.country_iso2 == element)).filter(element => element);

    const resetForm = () => {
        setTranslations([]);
        setIsActive(true);
    }

    useEffect(() => {
        const { id } = props ? props.match ? props.match.params : '' : '';

        async function getConsent() {
            const response = await axios.get(`/api/cdp-consents/${id}`);
            setConsent(response.data);
            setTranslations(response.data.translations.map(i => ({ ...i, country_iso2: i.locale.split('_')[1], lang_code: i.locale.split('_')[0] })));
            setIsActive(response.data.is_active);
            setConsentId(id);
            setCategoryId(response.data.consent_category.id);
            setLegalBasis(response.data.legal_basis);
        }
        async function getConsentCatogories() {
            const response = await axios.get('/api/privacy/consent-categories');
            setCategories(response.data);
        }
        async function getCountries() {
            const response = await axios.get('/api/countries');
            setUserCountries(fetchUserCountries(loggedInUser.countries, response.data));
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

    const getTranslations = () => {
        return translations.map((item, idx) => {
            const translationId = `Translation-${idx+1}`;
            const countryId = `country-${idx}`;
            const languageId = `language-${idx}`;
            const richTextId = `rich-text-${idx}`;

            return (<React.Fragment key={idx}>
                <div className="col-12">
                    <div className="row border border-primary rounded pb-3 mb-3 mx-0 shadow-sm">
                        <label className="col-12 font-weight-bold d-flex justify-content-between align-items-center bg-light py-2 border-bottom rounded-top">
                            {translationId}
                            <i className="fas fa-minus-circle text-danger fa-2x hover-opacity" type="button" title="Remove" onClick={() => removeTranslation(idx)}></i>
                        </label>
                        <div className="col-12 col-sm-6">
                            <div className="form-group">
                                <label className="font-weight-bold" htmlFor={countryId}>Select Country </label>
                                <Field className="form-control country_iso2" value={item.country_iso2.toLowerCase()} onChange={(e) => handleChange(e)} data-id={idx} as="select" name={countryId} id={countryId}>
                                    {userCountries.map(element => <option key={element.countryid} value={element.country_iso2.toLowerCase()}>{element.codbase_desc}</option>)}
                                </Field>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6">
                            <div className="form-group">
                                <label className="font-weight-bold" htmlFor={languageId}>Select Language</label>
                                <Field className="form-control lang_code" value={item.lang_code} onChange={(e) => handleChange(e)} data-id={idx} as="select" name={languageId} id={languageId}>
                                    {countryLanguages.map(element => {
                                        const [country_iso2, language_code, language_name] = element.split(' ');
                                        return language_name && <option key={country_iso2} value={language_code}>{language_name.replace(/,/g, '')}</option>
                                    })}
                                </Field>
                            </div>
                        </div>

                        {/* <div className="col-12">
                            <div className="form-group">
                                <label className="font-weight-bold" htmlFor={richTextId}>Rich Text</label>
                                <Field className="form-control rich_text" row="6" value={item.rich_text} onChange={(e) => handleChange(e)} type='textarea' as='textarea' data-id={idx} name={richTextId} id={richTextId} />
                                <div className="invalid-feedback"><ErrorMessage name={richTextId} /></div>
                            </div>
                        </div> */}

                        <div className="col-12">
                            <div className="form-group">
                                <label className="font-weight-bold" htmlFor={richTextId}>Rich Text</label>
                                <div className="border rounded draft-editor">
                                    <DraftEdior htmlContent={item.rich_text} onChangeHTML={(html) =>
                                        handleChange({
                                            target: {
                                                value: html,
                                                className: "form-control rich_text",
                                                dataset: {
                                                    id: idx
                                                }
                                            }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </React.Fragment>
        )});
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
                                    <li className="breadcrumb-item active"><span>Add new Consent</span></li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
                <div className="container">
                    {categories && userCountries && countryLanguages && categories.length > 0 && userCountries.length > 0 && countryLanguages.length > 0 &&
                        <div className="row">
                            <div className="col-12">
                                <div className="shadow-sm bg-white mb-3">
                                    <h2 className="d-flex align-items-center p-3 px-sm-4 py-sm-2 page-title light">
                                    <span className="page-title__text font-weight-bold py-3">{consentId ? 'Edit Consent' : 'Create New Consent'}</span>
                                    </h2>
                                    <div className="add-user p-3">
                                        <Formik
                                            initialValues={{
                                                category_id: consentId && consent.consent_category ? consent.consent_category.id : categories[0].id,
                                                legal_basis: consentId && consent ? consent.legal_basis : "consent",
                                                preference: consentId && consent ? consent.preference : "",
                                                translations: consentId && consent ? consent.translations : [],
                                                is_active: consentId && consent ? consent.is_active : isActive
                                            }}
                                            displayName="ConsentForm"
                                            validationSchema={consentSchema}
                                            onSubmit={(values, actions) => {
                                                values.is_active = isActive;
                                                if(consentId && consent) {
                                                    values.category_id = categoryId;
                                                    values.legal_basis = legalBasis;
                                                }

                                                const validTranslations = translations.filter(item => item.country_iso2 && item.lang_code && item.rich_text && item.rich_text !== '<p><br></p>');

                                                if (!validTranslations.length) {
                                                    addToast('Please provide at least one translation', {
                                                        appearance: 'error',
                                                        autoDismiss: true
                                                    });
                                                    actions.setSubmitting(false);
                                                    return;
                                                }

                                                values.translations = validTranslations;

                                                if(consentId){
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
                                                else{
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
                                                                        <Field className="form-control rich_text" type='text' name='preference' id='preference' />
                                                                        <div className="invalid-feedback"><ErrorMessage name='preference' /></div>
                                                                    </div>
                                                                </div>

                                                                <div className="col-12 col-sm-6">
                                                                    <div className="form-group">
                                                                        <label className="font-weight-bold" htmlFor="category_id">Select Category <span className="text-danger">*</span></label>
                                                                        {
                                                                            consentId && consent ?
                                                                            (<Field data-testid="category_id" as="select" name="category_id" className="form-control" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                                                                                {categories.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
                                                                            </Field>) :
                                                                            (<Field data-testid="category_id" as="select" name="category_id" className="form-control">
                                                                                {categories.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
                                                                            </Field>)
                                                                        }
                                                                        <div className="invalid-feedback"><ErrorMessage name="category_id" /></div>
                                                                    </div>
                                                                </div>

                                                                <div className="col-12 col-sm-6">
                                                                    <div className="form-group">
                                                                        <label className="font-weight-bold" htmlFor="category_id">Select Legal Basis <span className="text-danger">*</span></label>
                                                                        {
                                                                            consentId && consent ?
                                                                            (<Field data-testid="legal_basis" as="select" name="legal_basis" className="form-control text-capitalize" value={legalBasis} onChange={(e) => setLegalBasis(e.target.value)}>
                                                                                {['consent', 'contract'].map(item => <option key={item} value={item}>{item}</option>)}
                                                                            </Field>) :
                                                                            (<Field data-testid="legal_basis" as="select" name="legal_basis" className="form-control text-capitalize">
                                                                                {['consent', 'contract'].map(item => <option key={item} value={item}>{item}</option>)}
                                                                            </Field>)
                                                                        }
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

                                                                {getTranslations()}

                                                                <div className="col-12">
                                                                    <div className="form-group">
                                                                    <label className="d-flex align-items-center cdp-text-primary hover-opacity" type="button" onClick={addNewTranslation}>
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

        </main>
    );
}

export default ConsentForm;
