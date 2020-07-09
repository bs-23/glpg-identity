import React, { useState } from 'react';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import Axios from 'axios';
import { useHistory, useLocation } from 'react-router-dom';
import QueryString from 'query-string';

import { resetPasswordSchema } from '../user.schema';

const Alert = ({ type, message }) => (
    <div className={`alert alert-${type}`} role="alert">
        {message}
    </div>
);

export default function ResetPasswordForm() {
    const history = useHistory();
    const location = useLocation();
    const { email, token } = QueryString.parse(location.search);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    return (
        <div className="app-login">
            <div className="w-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-5 col-md-8 col-12 mx-auto p-0 shadow border bg-white">
                            <div className="p-3 bg-light h5 rounded-top"> Reset Password </div>
                            <div className="card-body">
                                <Formik
                                    initialValues={{
                                        newPassword: '',
                                        confirmPassword: '',
                                    }}
                                    displayName="ResetPasswordForm"
                                    validationSchema={resetPasswordSchema}
                                    onSubmit={(values, actions) => {
                                        Axios.put(`/api/users/password/resetPassword/?email=${email}&token=${token}`, values)
                                            .then(() => {
                                                setSuccess('Your password has been reset successfully. Redirecting...');
                                                setError('');
                                                setTimeout(() => {
                                                    history.replace('/login');
                                                }, 2000);
                                                actions.setSubmitting(false);
                                            })
                                            .catch(err => {
                                                setSuccess('');
                                                setError(err.response.data);
                                                actions.setSubmitting(false);
                                            });
                                    }}
                                >
                                    {formikProps => (
                                        <Form onSubmit={formikProps.handleSubmit}>
                                            <Field type="text" name="username" autoComplete="username" hidden />
                                            <div className="form-group">
                                                <Field
                                                    className="form-control"
                                                    type="password"
                                                    name="newPassword"
                                                    placeholder="New Password"
                                                    data-testid="newPassword"
                                                    autoComplete="new-password"
                                                />
                                                <div className="invalid-feedback" data-testid="newPasswordError">
                                                    <ErrorMessage name="newPassword" />
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <Field
                                                    className="form-control"
                                                    type="password"
                                                    name="confirmPassword"
                                                    placeholder="Confirm New Password"
                                                    autoComplete="current-password"
                                                    data-testid="confirmPassword"
                                                    autoComplete="new-password"
                                                />
                                                <div className="invalid-feedback" data-testid="confirmPasswordError" >
                                                    <ErrorMessage name="confirmPassword" />
                                                </div>
                                            </div>

                                            {error && <Alert type="danger" message={error} /> }
                                            {success && <Alert type="success" message={success} />}

                                            <button type="submit" className="btn btn-info btn-block" disabled={formikProps.isSubmitting} >
                                                Submit
                                            </button>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
