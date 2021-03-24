import React from 'react';
import parse from 'html-react-parser';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import axios from 'axios';
import { useToasts } from 'react-toast-notifications';
import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion';
import { ConsentSyncSchema } from '../hcp.schema';

const VeevaConsentSync = ({ userID, consents, onClose }) => {
    const { addToast } = useToasts();

    const showDateTime = (date) => {
        var today = new Date(date);
        var date = today.getDate()+'.'+(today.getMonth()+1)+'.'+today.getFullYear();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+' '+time;
        return dateTime;
    }

    return <div>
        <Formik
            initialValues={{
                comment: ''
            }}
            displayName="ConsentSyncForm"
            validationSchema={ConsentSyncSchema}
            onSubmit={async (values, actions) => {
                try {
                    await axios.put(`/api/hcp-profiles/${userID}/sync-consents-with-veeva`, values);

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
                    <div className="table-responsive shadow-sm bg-white mb-3 cdp-table__responsive-wrapper">
                        <div><span className="font-weight-bold">Most Recent Consent Sync Time: </span>{consents && showDateTime(consents[0].latestConsentSyncTime)}</div>
                        <div className="mt-2 mb-2">
                            <div className="col accordion-consent rounded p-0">
                                <h4 className="accordion-consent__header p-3 font-weight-bold mb-0 cdp-light-bg">Consents</h4>
                                {consents && consents.length ? <Accordion>{consents.map(consent =>
                                    <Card key={consent.id}>
                                        <Accordion.Collapse eventKey={consent.id}>
                                            <Card.Body>
                                                <div>{parse(consent.rich_text)}</div>
                                                <div className="pt-2"><span className="pr-1 text-dark"><i className="icon icon-check-square mr-1 small"></i>Opt-Type:</span> <span className="text-capitalize">{consent.opt_type}</span></div>
                                                <div><span className="pr-1 text-dark"><i className="icon icon-calendar-check mr-1 small"></i>Updated on:</span>{(new Date(consent.consent_given_time)).toLocaleDateString('en-GB').replace(/\//g, '.')}</div>
                                                <div><span className="pr-1 text-dark"><i className="icon icon-calendar-check mr-1 small"></i>Veeva multi channel consent id:</span>{consent.veeva_multichannel_consent_id}</div>
                                            </Card.Body>
                                        </Accordion.Collapse>
                                        <Accordion.Toggle as={Card.Header} eventKey={consent.id} className="p-3 d-flex align-items-baseline justify-content-between border-0" role="button">
                                            <span className="d-flex align-items-center"><i className={`icon ${consent.consent_given ? 'icon-check-filled' : 'icon-close-circle text-danger'} cdp-text-primary mr-4 consent-check`}></i> <span className="consent-summary">{consent.preference}</span></span>
                                            <i className="icon icon-arrow-down ml-2 accordion-consent__icon-down"></i>
                                        </Accordion.Toggle>
                                    </Card>
                                )}</Accordion> : <div className="m-3 alert alert-warning">The HCP has not given any consent.</div>}
                            </div>
                        </div>
                        <div className="col-12 col-sm-12">
                            <div className="form-group mb-0">
                                <label className="font-weight-bold" htmlFor="comment">Comment <span className="text-danger">*</span></label>
                                <div>
                                    <Field className="form-control" data-testid='comment' component="textarea" rows="4" name="comment" />
                                </div>
                                <div className="invalid-feedback"><ErrorMessage name="comment" /></div>
                            </div>
                        </div>
                        <div className="ml-3 mr-3">
                            <button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" >Sync with VeevaCRM</button>
                            <span className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" onClick={() => onClose()}>Cancel</span>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    </div>
}

export default VeevaConsentSync;
