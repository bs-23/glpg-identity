import React from 'react';
import parse from 'html-react-parser';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import axios from 'axios';
import { useToasts } from 'react-toast-notifications';
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

    console.log(userID, consents)
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
                        <table className="table table-hover table-sm mb-0 cdp-table cdp-table__responsive">
                            <thead className="cdp-bg-primary text-white cdp-table__header">
                                <tr>
                                    <th width="12%">Preference</th>
                                    <th width="12%">Rich Text</th>
                                    <th width="12%">Opt Type</th>
                                </tr>
                            </thead>
                            <tbody className="cdp-table__body bg-white">
                                {(consents|| []).map(row => (
                                    <tr key={row.id}>
                                        <td data-for="Preference" className="text-break">{row.preference}</td>
                                        <td data-for="Rich Text" className="text-break">{parse(row.rich_text)}</td>
                                        <td data-for="Opt Type" className="text-break">{row.opt_type}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="col-12 col-sm-12">
                            <div className="form-group mb-0">
                                <label className="font-weight-bold" htmlFor="comment">Comment <span className="text-danger">*</span></label>
                                <div>
                                    <Field className="form-control" data-testid='comment' component="textarea" rows="4" name="comment" />
                                </div>
                                <div className="invalid-feedback"><ErrorMessage name="comment" /></div>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" >Sync with VeevaCRM</button>
                    </div>
                </Form>
            )}
        </Formik>
    </div>
}

export default VeevaConsentSync;
