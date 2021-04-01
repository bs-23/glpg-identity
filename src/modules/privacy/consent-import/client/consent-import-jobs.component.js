import axios from 'axios';
import parse from 'html-react-parser';
import Modal from 'react-bootstrap/Modal';
import { NavLink } from 'react-router-dom';
import fileDownload from 'js-file-download';
import Dropdown from 'react-bootstrap/Dropdown';
import React, { useEffect, useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Formik, Field, ErrorMessage } from 'formik';

import Faq from '../../../platform/faq/client/faq.component';
import { ConsentImportJobSchema } from './consent-import-job.schema';
import { getCdpConsents } from '../../manage-consent/client/consent.actions';
import { getConsentCategories } from '../../consent-category/client/category.actions';
import { getCountryConsents } from '../../consent-country/client/consent-country.actions';
import { getConsentImportJobs, startConsentImportJob, cancelConsentImportJob } from './consent-import-job.actions';

export default function ConsentImportJobsComponent() {
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
    const [actionToPerform, setActionToPerform] = useState({});

    const consent_categories = useSelector(state => state.consentCategoryReducer.consent_categories);
    const cdp_consents = useSelector(state => state.consentReducer.cdp_consents);
    const country_consents = useSelector(state => state.consentCountryReducer.country_consents);
    const consentImportJobs = useSelector(state => state.consentImportJobReducer.consent_import_jobs);

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

    const getOptTypeText = (itemOptType) => {
        if (!itemOptType) return '--';
        const optType = optTypes.find(o => o.value === itemOptType);
        return optType ? optType.text : '--';
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

            fileDownload(res.data, `Job_report_${timestamp}.xlsx`);
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
        dispatch(startConsentImportJob(id)).then(() => {
            setActionToPerform({});
            addToast('Successfully completed job', {
                appearance: 'success',
                autoDismiss: true
            });
        }).catch(err => {
            setActionToPerform({});
            addToast('Job failed', {
                appearance: 'error',
                autoDismiss: true
            });
        });
    };

    const cancelJob = (id) => {
        dispatch(cancelConsentImportJob(id)).then(() => {
            setActionToPerform({});
            addToast('Job is successfully cancelled.', {
                appearance: 'success',
                autoDismiss: true
            });
        }).catch(err => {
            setActionToPerform({});
            addToast('Unable to perform the requset. Please try again.', {
                appearance: 'error',
                autoDismiss: true
            });
        });
    };

    const confirmAction = () => {
        if (actionToPerform.action === 'start' && actionToPerform.id) {
            startJob(actionToPerform.id);
        }

        if (actionToPerform.action === 'cancel' && actionToPerform.id) {
            cancelJob(actionToPerform.id);
        }
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
                                <li className="breadcrumb-item active"><span>Manage Consent Import Jobs</span></li>
                            </ol>
                            <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                    <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                    <Dropdown.Item className="px-2" href="/consent"><i className="fas fa-link mr-2"></i> Data Privacy & Consent Management</Dropdown.Item>
                                    <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> Manage Consent Import Jobs</Dropdown.Item>
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
                            <h4 className="cdp-text-primary font-weight-bold mb-0 mb-sm-0 d-flex align-items-end pr-2">Consent Import Jobs</h4>
                            <div class="d-flex justify-content-between align-items-center">
                                <button onClick={() => setShowForm(true)} className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus"></i> <span className="d-none d-sm-inline-block pl-1">Create New Job</span>
                                </button>
                                <Modal dialogClassName size="lg" centered show={showForm} onHide={() => setShowForm(false)}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>
                                            Create New Job
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
                                            displayName="ConsentImportJobForm"
                                            enableReinitialize={true}
                                            validationSchema={ConsentImportJobSchema}
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
                                                })).catch(err => addToast('An error occurred! Please try again.', {
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
                                                                    {consent_categories.filter(c => !!c.veeva_content_type_id).map(category => {
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
                                                                <div className="form-group richtext-preview rounded shadow-sm p-0">
                                                                    <label className="px-3 py-2 font-weight-bold mb-0 cdp-light-bg d-block" htmlFor="rich-text">Legal Text</label>
                                                                    <div className="text-muted p-3 mb-3 richtext-preview">
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
                                                                }} accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"/>
                                                                <div className="invalid-feedback"><ErrorMessage name="file" /></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button type="submit" className="btn cdp-btn-primary btn-block my-3 py-2 text-white shadow">Save changes</button>
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
                                            <th width="14%">Consent Preference</th>
                                            <th width="14%">Consent Category</th>
                                            <th width="12%">Consent Locale</th>
                                            <th width="12%">Total Records</th>
                                            <th width="12%">Status</th>
                                            <th width="12%">Created By</th>
                                            <th width="12%">Created At</th>
                                            <th width="12%">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {consentImportJobs.map(row => (
                                            <tr key={row.id}>
                                                <td data-for="Consent Preference" className="text-break">{row.consent.preference}</td>
                                                <td data-for="Consent Category" className="text-break">{row.consent.consent_category.title}</td>
                                                <td data-for="Consent Locale" className="text-break">{row.consent_locale}</td>
                                                <td data-for="Total Records" className="text-break">
                                                    {row.data.length ?
                                                        <a className="link-with-underline cursor-pointer font-weight-bold-light d-block h6" onClick={() => setSelectedImport(row.data)}>
                                                            {row.data.length}
                                                        </a>
                                                        : 0
                                                    }
                                                </td>
                                                <td data-for="Status" class="text-capitalize">
                                                    {row.status === 'not-ready' &&
                                                        <i className="fa fa-xs fa-circle text-secondary pr-2 hcp-status-icon"></i>
                                                    }
                                                    {row.status === 'ready' &&
                                                        <i className="fa fa-xs fa-circle text-warning pr-2 hcp-status-icon"></i>
                                                    }
                                                    {row.status === 'completed' &&
                                                        <i className="fa fa-xs fa-circle text-success pr-2 hcp-status-icon"></i>
                                                    }
                                                    {row.status === 'cancelled' &&
                                                        <i className="fa fa-xs fa-circle text-danger pr-2 hcp-status-icon"></i>
                                                    }
                                                    {row.status.split('-').join(' ')}
                                                </td>
                                                <td data-for="Created By" className="text-break">{`${row.createdByUser.first_name} ${row.createdByUser.last_name}`}</td>
                                                <td data-for="Created At" className="text-break">{(new Date(row.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')}</td>
                                                <td data-for="Action"><Dropdown className="ml-auto dropdown-customize">
                                                    <Dropdown.Toggle variant className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1 dropdown-toggle">
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item onClick={() => { setShowDetail(true); setDetails(row); }}>Details</Dropdown.Item>
                                                        {row.status === 'ready' &&
                                                            <Dropdown.Item onClick={() => setActionToPerform({ action: 'start', id: row.id })}>Start</Dropdown.Item>
                                                        }
                                                        {row.status !== 'cancelled' && row.status !== 'completed' &&
                                                            <Dropdown.Item className="text-danger" onClick={() => setActionToPerform({ action: 'cancel', id: row.id })}>Cancel</Dropdown.Item>
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
                    size="xl"
                    centered
                    show={!!selectedImport}
                    onHide={() => setSelectedImport(null)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Total Records</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="modal-body__mh-500">
                        {selectedImport && selectedImport.length &&
                            <table className="table table-hover table-sm mb-0 cdp-table mb-0 cdp-table__responsive">
                                <thead className="cdp-bg-primary text-white cdp-table__header">
                                    <tr>
                                        <th width="15%">Individual OneKeyId</th>
                                        <th width="15%">Email</th>
                                        <th width="15%">Opt-In Date</th>
                                        <th width="15%">Opt Type</th>
                                        <th width="15%">Multichannel Consent ID</th>
                                    </tr>
                                </thead>
                                <tbody className="cdp-table__body bg-white">
                                    {selectedImport.map((item, index) => (
                                        <tr key={'item-' + index}>
                                            <td data-for="Individual OneKeyId" className="text-break">{item.onekey_id || '--'}</td>
                                            <td data-for="Email" className="text-break">{item.email || '--'}</td>
                                            <td data-for="Opt-In Date" className="text-break">
                                                {item.captured_date
                                                    ? (new Date(item.captured_date)).toLocaleDateString('en-GB').replace(/\//g, '.')
                                                    : '--'
                                                }
                                            </td>
                                            <td data-for="Opt Type" className="text-break">{getOptTypeText(item.opt_type)}</td>
                                            <td data-for="Multichannel Consent ID" className="text-break">{item.multichannel_consent_id || '--'}</td>
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
                        <Modal.Title>Job Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {details &&
                            <div className="row">
                                <div className="col-12 col-sm-6">
                                    <div className="mb-0 font-weight-bold-light">Consent Preference</div>
                                    <p>{details.consent.preference}</p>
                                    <div className="mb-0 font-weight-bold-light">Consent Category</div>
                                    <p>{details.consent.consent_category.title}</p>
                                    <div className="mb-0 font-weight-bold-light">Consent Locale</div>
                                    <p>{details.consent_locale}</p>
                                </div>
                                <div className="col-12 col-sm-6">
                                    <div className="mb-0 font-weight-bold-light">Total Records</div>
                                    <p>{details.data.length}</p>
                                    <div className="mb-0 font-weight-bold-light">Execution Date</div>
                                    <p>{(new Date(details.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')}</p>
                                </div>
                                <div className="col-12">
                                    <div className="rounded shadow-sm p-0">
                                        <label className="px-3 py-2 font-weight-bold mb-0 cdp-light-bg d-block">Legal Text</label>
                                        <div className="text-muted p-3 mb-3 richtext-preview">
                                            {getLegalText(details.consent_id, details.consent_locale)}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <button type="button" className="btn cdp-btn-primary my-3 py-2 text-white shadow" onClick={() => DownloadFile(details.id)}><i className="fas fa-download mr-2"></i> Download the original file</button>
                                    {details.status === 'completed' &&
                                        <button type="button" className="btn cdp-btn-primary my-3 py-2 text-white shadow ml-2" onClick={() => exportRecords(details.id)}><i className="fas fa-download mr-2"></i> Download Job Report</button>
                                    }
                                </div>
                            </div>
                        }
                    </Modal.Body>
                </Modal>

                <Modal
                    centered
                    show={!!actionToPerform.action}
                    onHide={() => setActionToPerform({})}>
                    <Modal.Header closeButton>
                        <Modal.Title className="modal-title_small text-capitalize">{actionToPerform.action} Job</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {actionToPerform.action && actionToPerform.id ? (
                            <div>
                                Are you sure you want to {actionToPerform.action} this job?
                            </div>
                        ) : null}
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn cdp-btn-outline-primary" onClick={() => setActionToPerform({})}>Cancel</button>
                        <button className="ml-2 btn cdp-btn-secondary text-white" onClick={() => confirmAction()}>Confirm</button>
                    </Modal.Footer>
                </Modal>
            </div>
        </main>
    )
}
