import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import { NavLink } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import React, { useEffect, useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import parse from 'html-react-parser';
import fileDownload from 'js-file-download';

import Faq from '../../../platform/faq/client/faq.component';
import { getConsentImportJobs } from './import-consents.actions';
import { ImportConsentsSchema } from './import-consents.schema';
import { getCdpConsents } from '../../../privacy/manage-consent/client/consent.actions';
import { getCountryConsents } from '../../consent-country/client/consent-country.actions';
import { getConsentCategories } from '../../../privacy/consent-category/client/category.actions';

export default function ImportConsentsDashboard() {
    const dispatch = useDispatch();
    const { addToast } = useToasts();
    const [showFaq, setShowFaq] = useState(false);
    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [details, setDetails] = useState(null);
    const [localizations, setLocalizations] = useState([]);
    const [consentLocales, setConsentLocales] = useState(false);
    const [selectedImport, setSelectedImport] = useState(null);
    const consent_categories = useSelector(state => state.consentCategoryReducer.consent_categories);
    const cdp_consents = useSelector(state => state.consentReducer.cdp_consents);
    const country_consents = useSelector(state => state.consentCountryReducer.country_consents);
    const consentImportJobs = useSelector(state => state.consentImportReducer.consent_import_jobs);
    const optTypes = [
        {
            text: 'Single Opt-in',
            value: 'single-opt-in'
        },
        {
            text: 'Double Opt-in',
            value: 'double-opt-in'
        },
        {
            text: 'Opt-out',
            value: 'opt-out'
        }
    ];

    const getLegalText = (consent_id, locale) => {
        const consent_locale = consentLocales.find(x => x.consent_id === consent_id && x.locale === locale);

        return parse(consent_locale.rich_text);
    };

    useEffect(() => {
        async function getLocalizations() {
            const { data } = await axios.get('/api/localizations');
            setLocalizations(data);
        }

        getLocalizations();
        dispatch(getConsentCategories());
        dispatch(getConsentImportJobs());
        dispatch(getCdpConsents());
        dispatch(getCountryConsents());
    }, []);

    useEffect(() => {
        mapConsentLocales();
    }, [cdp_consents, country_consents, localizations]);

    const mapConsentLocales = () => {
        const consentLocaleList = country_consents.map(x => x.consent);
        const temp_locales = [];
        consentLocaleList.forEach(elem => {
            elem.translations.forEach(item => {
                item.locale_detail = localizations.filter(x => x.locale === item.locale)[0];
                item.consent_id = elem.id;
                temp_locales.push(item);
            });
        });
        setConsentLocales([...new Map(temp_locales.map(item => [item['id'], item])).values()]);
    };

    const DownloadFile = (id) => {
        axios.get(`/api/consent-import-jobs/${id}/download`).then(({ data }) => {
            const newWindow = window.open(data, '_blank', 'noopener,noreferrer')
            if (newWindow) newWindow.opener = null
        }).catch(err => {
            addToast('Could not download file', {
                appearance: 'error',
                autoDismiss: true
            });
        });
    };

    const exportRecords = (id) => {
        axios.get(`/api/consent-import-jobs/${id}/export`, {
            responseType: 'blob',
        }).then(res => {
            const pad2 = (n) => (n < 10 ? '0' + n : n);

            var date = new Date();
            const timestamp = date.getFullYear().toString() + pad2(date.getMonth() + 1) + pad2(date.getDate()) + pad2(date.getHours()) + pad2(date.getMinutes()) + pad2(date.getSeconds());

            fileDownload(res.data, `Imported_Consent_Records_${timestamp}.xlsx`);
        }).catch(error => {
            /**
             * the error response is a blob because of the responseType option.
             * text() converts it back to string
             */
            error.response.data.text().then(text => {
                addToast(text, {
                    appearance: 'warning',
                    autoDismiss: true
                });
            });
        });
    };

    const startJob = (id) => {
        axios.post(`/api/consent-import-jobs/${id}/start`).then(response => {
            addToast('Successfully completed job', {
                appearance: 'success',
                autoDismiss: true
            });
        }).catch(err => {
            addToast('Job failed', {
                appearance: 'error',
                autoDismiss: true
            });
        });
    };

    const cancelJob = (id) => {
        axios.delete(`/api/consent-import-jobs/${id}`).then(response => {
            addToast('Job cancelled successfully', {
                appearance: 'success',
                autoDismiss: true
            });
        }).catch(err => {
            addToast('Job cacel failed', {
                appearance: 'error',
                autoDismiss: true
            });
        });
    };

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
                        <div className="d-flex justify-content-between align-items-center py-3 cdp-table__responsive-sticky-panel">
                            <h4 className="cdp-text-primary font-weight-bold mb-0 mb-sm-0 d-flex align-items-end pr-2">Import HCP Consents </h4>
                            <div class="d-flex justify-content-between align-items-center">
                                <button onClick={() => setShowForm(true)} className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus"></i> <span className="d-none d-sm-inline-block pl-1">Create New Job</span>
                                </button>
                                <Modal dialogClassName size="lg" centered show={showForm} onHide={() => setShowForm(false)}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>
                                            Import Consents Into VeevaCRM
                                        </Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <Formik
                                            initialValues={{
                                                consent_category: '',
                                                consent_id: '',
                                                consent_locale: '',
                                                opt_type: '',
                                                file: ''
                                            }}
                                            displayName="ConsentImport"
                                            enableReinitialize={true}
                                            validationSchema={ImportConsentsSchema}
                                            onSubmit={(values, actions) => {
                                                const data = new FormData();
                                                data.append('consent_category', values.consent_category);
                                                data.append('consent_id', values.consent_id);
                                                data.append('consent_locale', values.consent_locale);
                                                data.append('opt_type', values.opt_type);
                                                data.append('file', values.file);

                                                axios.post(`/api/consent-import-jobs`, data, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                }).then(() => addToast('Consents imported successfully', {
                                                    appearance: 'success',
                                                    autoDismiss: true
                                                })).catch(err => addToast('An error occurred!', {
                                                    appearance: 'error',
                                                    autoDismiss: true
                                                })).finally(() => dispatch(getConsentImportJobs()));

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
                                                                <label className="font-weight-bold" htmlFor="consent_category">Consent Category <span className="text-danger">*</span></label>
                                                                <Field data-testid="consent_category" as="select" name="consent_category" className="form-control">
                                                                    <option key="select-consent-category" value="" disabled>--Select--</option>
                                                                    {consent_categories.map(category => {
                                                                        return <option key={category.id} value={category.id}>{category.title}</option>
                                                                    })}
                                                                </Field>
                                                                <div className="invalid-feedback"><ErrorMessage name="consent_category" /></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12">
                                                            <div className="form-group">
                                                                <label className="font-weight-bold" htmlFor="consent_id">Preference <span className="text-danger">*</span></label>
                                                                <Field data-testid="consent" as="select" name="consent_id" className="form-control">
                                                                    <option key="select-consent" value="" disabled>--Select--</option>
                                                                    {cdp_consents.map(item => formikProps.values.consent_category === item.category_id &&
                                                                        <option key={item.id} value={item.id}>{item.preference}</option>
                                                                    )}
                                                                </Field>
                                                                <div className="invalid-feedback"><ErrorMessage name="consent_id" /></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12">
                                                            <div className="form-group">
                                                                <label className="font-weight-bold" htmlFor="consent_locale">Localization <span className="text-danger">*</span></label>
                                                                <Field data-testid="locale" as="select" name="consent_locale" className="form-control">
                                                                    <option key="select-locale" value="" disabled>--Select--</option>
                                                                    {consentLocales.map(item => formikProps.values.consent_id === item.consent_id &&
                                                                        <option key={item.id} value={item.locale_detail.locale}>{`${item.locale_detail.language_variant} ( ${item.locale_detail.locale} )`}</option>
                                                                    )}
                                                                </Field>
                                                                <div className="invalid-feedback"><ErrorMessage name="consent_locale" /></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12">
                                                            {
                                                                formikProps.values.consent_locale && formikProps.values.consent_locale !== '' &&
                                                                <div className="form-group richtext-preview">
                                                                    <label className="font-weight-bold" htmlFor="rich-text">Legal Text</label>
                                                                    <div className="text-muted cdp-light-bg p-3 mb-3">
                                                                        {getLegalText(formikProps.values.consent_id, formikProps.values.consent_locale)}
                                                                    </div>
                                                                </div>
                                                            }
                                                        </div>

                                                        <div className="col-12">
                                                            <div className="form-group">
                                                                <label className="font-weight-bold" htmlFor="opt_type">Opt Type<span className="text-danger">*</span></label>
                                                                <Field data-testid="opt_type" as="select" name="opt_type" className="form-control">
                                                                    <option key="select-opt-type" value="" disabled>--Select--</option>
                                                                    {optTypes.map(optType => {
                                                                        return <option key={optType.value} value={optType.value}>{optType.text}</option>
                                                                    })}
                                                                </Field>
                                                                <div className="invalid-feedback"><ErrorMessage name="opt_type" /></div>
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
                                                    <button type="submit" className="btn cdp-btn-primary btn-block my-3 py-2 text-white shadow">Upload to VeevaCRM</button>
                                                </Form>
                                            )}
                                        </Formik>
                                    </Modal.Body>
                                </Modal>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between align-items-center cdp-table__responsive-wrapper">
                            {consentImportJobs && consentImportJobs.length > 0 &&
                                <table className="table table-hover table-sm mb-0 cdp-table mb-0 cdp-table__responsive">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">
                                        <tr>
                                            <th width="15%">Consent Preference</th>
                                            <th width="15%">Consent Category</th>
                                            <th width="15%">Consent Locale</th>
                                            <th width="15%">Total Records</th>
                                            <th width="15%">Status</th>
                                            <th width="15%">Executed By</th>
                                            <th width="15%">Execution Date</th>
                                            <th width="10%">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {consentImportJobs.map(row => (
                                            <tr key={row.id}>
                                                <td data-for="Category" className="text-break">{row.consent.preference}</td>
                                                <td data-for="Category" className="text-break">{row.consent.consent_category.title}</td>
                                                <td data-for="Locale" className="text-break">{row.consent_locale}</td>
                                                <td data-for="Total Records" className="text-break">
                                                    {row.data.length ?
                                                        <a className="link-with-underline cursor-pointer" onClick={() => setSelectedImport(row.data)}>
                                                            {row.data.length}
                                                        </a>
                                                        : 0
                                                    }
                                                </td>
                                                <td data-for="Status" class="text-capitalize">{row.status.split('-').join(' ')}</td>
                                                <td data-for="Created By" className="text-break">{`${row.createdByUser.first_name} ${row.createdByUser.last_name}`}</td>
                                                <td data-for="Created On" className="text-break">{(new Date(row.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')}</td>
                                                <td data-for="Action"><Dropdown className="ml-auto dropdown-customize">
                                                    <Dropdown.Toggle variant className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1 dropdown-toggle">
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item onClick={() => { setShowDetail(true); setDetails(row); }}>Details</Dropdown.Item>
                                                        {row.status === 'ready' &&
                                                            <Dropdown.Item onClick={() => startJob(row.id)}>Start</Dropdown.Item>
                                                        }
                                                        {row.status !== 'completed' &&
                                                            <Dropdown.Item onClick={() => cancelJob(row.id)}>Cancel</Dropdown.Item>
                                                        }
                                                    </Dropdown.Menu>
                                                </Dropdown></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            }
                        </div>
                        {consentImportJobs && consentImportJobs.length === 0 &&
                            <div className="row justify-content-center mt-5 pt-5 mb-3">
                                <div className="col-12 col-sm-6 py-4 bg-white shadow-sm rounded text-center">
                                    <i class="icon icon-team icon-6x cdp-text-secondary"></i>
                                    <h3 className="font-weight-bold cdp-text-primary pt-4">No jobs found!</h3>
                                </div>
                            </div>
                        }
                    </div>
                </div>

                <Modal
                    size="lg"
                    centered
                    show={!!selectedImport}
                    onHide={() => setSelectedImport(null)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Imported Consent Records</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedImport && selectedImport.length &&
                            <table className="table table-hover table-sm mb-0 cdp-table mb-0 cdp-table__responsive">
                                <thead className="cdp-bg-primary text-white cdp-table__header">
                                    <tr>
                                        <th width="15%">Individual OneKeyId</th>
                                        <th width="15%">Email</th>
                                        <th width="15%">Opt-In Date</th>
                                        <th width="15%">Multichannel Consent ID</th>
                                    </tr>
                                </thead>
                                <tbody className="cdp-table__body bg-white">
                                    {selectedImport.map((item, index) => (
                                        <tr key={'item-' + index}>
                                            <td className="text-break">{item.onekey_id || '--'}</td>
                                            <td className="text-break">{item.email || '--'}</td>
                                            <td className="text-break">
                                                {item.captured_date
                                                    ? (new Date(item.captured_date)).toLocaleDateString('en-GB').replace(/\//g, '.')
                                                    : '--'
                                                }
                                            </td>
                                            <td className="text-break">{item.multichannel_consent_id || '--'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        }
                    </Modal.Body>
                </Modal>

                <Modal
                    size="lg"
                    centered
                    show={showDetail}
                    onHide={() => { setShowDetail(false); setDetails(null); }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Imported Hcp Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {details &&
                            <div className="row">
                                <div className="col-6">
                                    <h4 className="mb-0 font-weight-bold-light">Consent Preference</h4>
                                    <p>{details.consent.preference}</p>
                                    <h4 className="mb-0 font-weight-bold-light">Consent Category</h4>
                                    <p>{details.consent.consent_category.title}</p>
                                    <h4 className="mb-0 font-weight-bold-light">Consent Locale</h4>
                                    <p>{details.consent_locale}</p>
                                </div>
                                <div className="col-6">
                                    <h4 className="mb-0 font-weight-bold-light">Total Records</h4>
                                    <p>{details.data.length}</p>
                                    <h4 className="mb-0 font-weight-bold-light">Execution Date</h4>
                                    <p>{(new Date(details.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')}</p>
                                </div>
                                <div className="col-12">
                                    <h4 className="mb-0 font-weight-bold-light">Legal Text</h4>
                                    <div className="text-muted cdp-light-bg p-3 mb-3">
                                        {getLegalText(details.consent_id, details.consent_locale)}
                                    </div>
                                </div>

                                <div className="col-12">
                                    <button type="button" className="btn cdp-btn-primary my-3 py-2 text-white shadow" onClick={() => DownloadFile(details.id)}>Download the original file</button>
                                    {details.status === 'completed' &&
                                        <button type="button" className="btn cdp-btn-primary my-3 py-2 text-white shadow ml-3" onClick={() => exportRecords(details.id)}>Export the report</button>
                                    }
                                </div>
                            </div>
                        }
                    </Modal.Body>
                </Modal>
            </div>
        </main>
    )
}
