import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Faq from '../../../platform/faq/client/faq.component';
import Dropdown from 'react-bootstrap/Dropdown';
import { NavLink } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import { getConsentCategories } from '../../../privacy/consent-category/client/category.actions';
import { getCdpConsents } from '../../../privacy/manage-consent/client/consent.actions';
import { getCountryConsents } from '../../consent-country/client/consent-country.actions';
import { getImportedConsents } from './import-consents.actions';
import { ImportConsentsSchema } from './import-consents.schema';
import axios from 'axios';
import { useToasts } from 'react-toast-notifications';

export default function ImportConsentsDashboard() {
    const dispatch = useDispatch();
    const { addToast } = useToasts();
    const [showFaq, setShowFaq] = useState(false);
    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);
    const [showForm, setShowForm] = useState(false);
    const [localizations, setLocalizations] = useState([]);
    const [consentLocales, setConsentLocales] = useState(false);
    const consent_categories = useSelector(state => state.consentCategoryReducer.consent_categories);
    const cdp_consents = useSelector(state => state.consentReducer.cdp_consents);
    const country_consents = useSelector(state => state.consentCountryReducer.country_consents);
    const imported_consents = useSelector(state => state.importedConsentReducer.imported_consents);

    useEffect(() => {
        async function getLocalizations() {
            const { data } = await axios.get('/api/localizations');
            setLocalizations(data);
        }
        getLocalizations();
        dispatch(getConsentCategories());
        dispatch(getImportedConsents());
        dispatch(getCdpConsents(null, null));
        dispatch(getCountryConsents());
    }, []);

    useEffect(() => {
        consentMapping();
    }, [cdp_consents, country_consents, localizations]);

    const consentMapping = () => {
        const consent_locale_list = country_consents.map(x => x.consent);
        const temp_locales = [];
        consent_locale_list.forEach(elem => {

            elem.translations.forEach(item => {
                item.locale_detail = localizations.filter(x => x.locale === item.locale)[0];
                item.consent_id = elem.id;
                temp_locales.push(item);
            });

        });
        console.log([...new Map(temp_locales.map(item =>
            [item['id'], item])).values()]);


        setConsentLocales([...new Map(temp_locales.map(item =>
            [item['id'], item])).values()]);
    }

    const DownloadFile = (id) => {
        axios.get(`/api/consent/imported-hcp-consents/${id}/download`)
            .then(({ data }) => {
                const newWindow = window.open(data, '_blank', 'noopener,noreferrer')
                if (newWindow) newWindow.opener = null
            })
            .catch(err => {
                addToast('Could not download file', {
                    appearance: 'error',
                    autoDismiss: true
                });
            });

    }

    return (

        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav className="breadcrumb justify-content-between align-items-center" aria-label="breadcrumb">
                            <ol className="rounded-0 m-0 p-0 d-none d-sm-flex">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/consent">Data Privacy & Consent Management</NavLink></li>
                                <li className="breadcrumb-item active"><span>Import HCP Consents</span></li>
                            </ol>
                            <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                    <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                    <Dropdown.Item className="px-2" href="/consent"><i className="fas fa-link mr-2"></i> Data Privacy & Consent Management</Dropdown.Item>
                                    <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> Import HCP Consents</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <span className="ml-auto mr-3"><i onClick={handleShowFaq} className="icon icon-help breadcrumb__faq-icon cdp-text-secondary cursor-pointer"></i></span>
                        </nav>
                        <Modal show={showFaq} onHide={handleCloseFaq} size="lg" centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Questions You May Have</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="faq__in-modal"><Faq topic="configure-consent-category" /></Modal.Body>
                        </Modal>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center py-3">
                            <h4 className="cdp-text-primary font-weight-bold mb-0 mb-sm-0 d-flex align-items-end pr-2">Import HCP Consents </h4>
                            <div class="d-flex justify-content-between align-items-center">
                                <button onClick={() => setShowForm(true)} className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus"></i> <span className="d-none d-sm-inline-block pl-1">Import consents</span>
                                </button>
                                <Modal dialogClassName="modal-90w modal-customize" centered show={showForm} onHide={() => setShowForm(false)}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>
                                            Import Consents
                                        </Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <Formik
                                            initialValues={{
                                                consent_category: "",
                                                consent_id: "",
                                                locale: "",
                                                file: ""
                                            }}
                                            displayName="ConsentImport"
                                            enableReinitialize={true}
                                            validationSchema={ImportConsentsSchema}
                                            onSubmit={(values, actions) => {

                                                const data = new FormData();
                                                data.append('consent_category', values.consent_category);
                                                data.append('consent_id', values.consent_id);
                                                data.append('locale', values.locale);
                                                data.append('file', values.file);

                                                console.log(data);

                                                axios.post(`/api/consent/bulk-import`, data, {
                                                    headers: {
                                                        'Content-Type': 'multipart/form-data'
                                                    }
                                                })
                                                    .then(() => addToast('Consents imported successfully', {
                                                        appearance: 'success',
                                                        autoDismiss: true
                                                    }))
                                                    .catch(err => addToast('Could not import consents', {
                                                        appearance: 'error',
                                                        autoDismiss: true
                                                    }))
                                                    .finally(() => dispatch(getImportedConsents()));

                                                actions.setSubmitting(false);
                                                actions.resetForm();
                                                setShowForm(false);
                                            }}
                                        >
                                            {formikProps => (
                                                <Form onSubmit={formikProps.handleSubmit} encType="multipart/form-data">
                                                    <div className="row">
                                                        <div className="col-12">
                                                            <div className="form-group">
                                                                <label className="font-weight-bold" htmlFor="consent_category">Select Consent Category <span className="text-danger">*</span></label>
                                                                <Field data-testid="consent_category" as="select" name="consent_category" className="form-control">
                                                                    <option key="select-consent-category" value="" disabled>--Select Consent Category--</option>
                                                                    {consent_categories.map(category => {
                                                                        return <option key={category.id} value={category.id}>{category.title}</option>
                                                                    })
                                                                    }
                                                                </Field>
                                                                <div className="invalid-feedback"><ErrorMessage name="consent_category" /></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12">
                                                            <div className="form-group">
                                                                <label className="font-weight-bold" htmlFor="consent_id">Select Consent <span className="text-danger">*</span></label>
                                                                <Field data-testid="consent" as="select" name="consent_id" className="form-control">
                                                                    <option key="select-consent" value="" disabled>--Select Consent--</option>
                                                                    {cdp_consents.map(item => formikProps.values.consent_category === item.category_id &&
                                                                        <option key={item.id} value={item.id}>{item.preference}</option>)}
                                                                </Field>
                                                                <div className="invalid-feedback"><ErrorMessage name="consent_id" /></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12">
                                                            <div className="form-group">
                                                                <label className="font-weight-bold" htmlFor="locale">Select Localization <span className="text-danger">*</span></label>
                                                                <Field data-testid="locale" as="select" name="locale" className="form-control">
                                                                    <option key="select-locale" value="" disabled>--Select Localization--</option>
                                                                    {consentLocales.map(item => formikProps.values.consent_id === item.consent_id &&
                                                                        <option key={item.id} value={item.locale_detail.locale}>{`${item.locale_detail.language_variant} ( ${item.locale_detail.locale} )`}</option>)}
                                                                </Field>
                                                                <div className="invalid-feedback"><ErrorMessage name="locale" /></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12">
                                                            <div className="form-group">
                                                                <label className="font-weight-bold d-block" htmlFor="file">File <span className="text-danger">*</span></label>
                                                                <input id="file" name="file" type="file" onChange={(event) => {
                                                                    formikProps.setFieldValue("file", event.currentTarget.files[0]);
                                                                }} />
                                                                <div className="invalid-feedback"><ErrorMessage name="file" /></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button type="submit" className="btn cdp-btn-primary mr-2 text-white shadow-sm">Save Changes</button>
                                                </Form>
                                            )}
                                        </Formik>
                                    </Modal.Body>
                                </Modal>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between align-items-center py-3 cdp-table__responsive-sticky-panel">
                            {imported_consents && imported_consents.length > 0 &&
                                <table className="table table-hover table-sm mb-0 cdp-table mb-0 cdp-table__responsive">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">
                                        <tr>
                                            <th width="20%">Total consents</th>
                                            <th width="20%">Locale</th>
                                            <th width="20%">Created By</th>
                                            <th width="20%">Created On</th>
                                            <th width="20%">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {imported_consents.map(row => (
                                            <tr key={row.id}>
                                                <td className="text-break">{row.result.length}</td>
                                                <td className="text-break">{row.consent_locale}</td>
                                                <td className="text-break">{row.createdBy}</td>
                                                <td className="text-break">{(new Date(row.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')}</td>
                                                <td><Dropdown className="ml-auto dropdown-customize">
                                                    <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1 dropdown-toggle ">
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item onClick={() => DownloadFile(row.id)}>Download</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown></td>
                                            </tr>
                                        ))}

                                    </tbody>
                                </table>
                            }
                        </div>
                        {imported_consents && imported_consents.length === 0 &&
                            <div className="row justify-content-center mt-5 pt-5 mb-3">
                                <div className="col-12 col-sm-6 py-4 bg-white shadow-sm rounded text-center">
                                    <i class="icon icon-team icon-6x cdp-text-secondary"></i>
                                    <h3 className="font-weight-bold cdp-text-primary pt-4">No Imported HCP Consent Found!</h3>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>

        </main>

    )
}
