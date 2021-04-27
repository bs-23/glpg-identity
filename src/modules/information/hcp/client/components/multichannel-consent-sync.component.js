import React from 'react';
import axios from 'axios';
import parse from 'html-react-parser';
import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion';
import { useToasts } from 'react-toast-notifications';
import { Form, Formik, Field, ErrorMessage } from 'formik';

import { MultichannelConsentSyncSchema } from '../hcp.schema';

const MultichannelConsentSync = ({ userID, consents, onClose }) => {
    const { addToast } = useToasts();

    const showDateTime = (date) => {
        if (!date) return '';

        var today = new Date(date);
        var date = today.getDate()+'.'+(today.getMonth()+1)+'.'+today.getFullYear();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+' '+time;
        return dateTime;
    };

    return <div>
        <Formik
            initialValues={{
                comment: ''
            }}
            displayName="MultichannelConsentSyncForm"
            validationSchema={MultichannelConsentSyncSchema}
            onSubmit={async (values, actions) => {
                try {
                    await axios.put(`/api/hcp-profiles/${userID}/multichannel-consents`, values);

                    addToast('Consents are successfully synced with Veeva CRM.', {
                        appearance: 'success',
                        autoDismiss: true
                    });

                    onClose();
                } catch(err) {
                    addToast(err, {
                        appearance: 'error',
                        autoDismiss: true
                    });
                }
                actions.setSubmitting(false);
            }}
        >
            {formikProps => (
                <Form onSubmit={formikProps.handleSubmit}>
                    <div className="p-3">
                        <span className="text-secondary"><i className="fas fa-info-circle pr-2 cdp-text-secondary"></i>Last execution date: </span>
                        {
                            consents && consents[0].latestConsentSyncTime
                                ? <span className="font-weight-bold-light pl-1">{consents && showDateTime(consents[0].latestConsentSyncTime)}</span>
                                : <span className="pl-1 text-secondary">Not yet synced.</span>
                        }
                    </div>

                    <div className="table-responsive shadow-sm bg-white mb-3 cdp-table__responsive-wrapper">
                        <div className="mt-2 mb-2">
                            <div className="col accordion-consent rounded p-0 pb-2">
                                <h4 className="accordion-consent__header p-3 font-weight-bold mb-0 cdp-light-bg">Consents</h4>
                                {consents && consents.filter(c => c.veeva_consent_type_id).length ? <Accordion>{consents.filter(c => c.veeva_consent_type_id).map(consent =>
                                    <Card key={consent.id}>
                                        <Accordion.Collapse eventKey={consent.id}>
                                            <Card.Body>
                                                <div>{parse(consent.rich_text)}</div>
                                                <div className="pt-2"><span className="pr-1 text-dark"><i className="icon icon-check-square mr-1 small"></i>Opt-Type:</span> <span className="text-capitalize">{consent.opt_type}</span></div>
                                                <div><span className="pr-1 text-dark"><i className="icon icon-calendar-check mr-1 small"></i>Capture date:</span>{(new Date(consent.consent_given_time)).toLocaleDateString('en-GB').replace(/\//g, '.')}</div>
                                                <div><span className="pr-1 text-dark"><i className="fas fa-cogs mr-1 small"></i>Multichannel consent:</span>{consent.veeva_multichannel_consent_id}</div>
                                            </Card.Body>
                                        </Accordion.Collapse>
                                        <Accordion.Toggle as={Card.Header} eventKey={consent.id} className="p-3 d-flex align-items-baseline justify-content-between border-0" role="button">
                                            <span className="d-flex align-items-center"><i className={`icon icon-check-filled cdp-text-primary mr-4 consent-check`}></i> <span className="consent-summary">{consent.preference}</span></span>
                                            <i className="icon icon-arrow-down ml-2 accordion-consent__icon-down"></i>
                                        </Accordion.Toggle>
                                    </Card>
                                )}</Accordion> : <div className="m-3 alert alert-warning">The HCP has not given any consent or there are no consent to sync.</div>}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12">
                            <div className="form-group mb-0">
                                <label className="font-weight-bold" htmlFor="comment">Remarks <span className="text-danger">*</span></label>
                                <div>
                                    <Field className="form-control" data-testid='comment' component="textarea" rows="4" name="comment" />
                                </div>
                                <div className="invalid-feedback"><ErrorMessage name="comment" /></div>
                            </div>
                        </div>
                        <div className="col-8">
                            <button
                                disabled={!consents || consents.filter(c => c.veeva_consent_type_id).length === 0}
                                type="submit"
                                className="btn btn-block cdp-btn-primary my-4 p-2 font-weight-bold text-white"
                            >
                                Sync with VeevaCRM
                            </button>
                        </div>
                        <div className="col-4">
                            <span className="btn btn-block cdp-btn-outline-secondary my-4 p-2 font-weight-bold" onClick={() => onClose()}>Cancel</span>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    </div>
};

export default MultichannelConsentSync;
