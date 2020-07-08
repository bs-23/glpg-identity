import React, { useState } from 'react';
import { Form, Formik, Field, ErrorMessage } from 'formik';

import { forgotPasswordSchema } from '../user.schema';

import Axios from 'axios';

const Alert = ({ type, message }) => (
    <div className={`alert alert-${type}`} role="alert">
        {message}
    </div>
);

export default function ForgotPassword() {
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    return (
        <div className="app-login">
            <div className="w-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-5 col-md-8 col-12 mx-auto p-0 shadow border bg-white">
                            <div className="p-3 bg-light h5 rounded-top">
                                Forgot Password
                            </div>
                            <div className="px-4 py-2 text-secondary">
                                Please enter the email you used at the time of
                                registration to get the password reset
                                instruction
                            </div>
                            <div className="card-body">
                                <Formik
                                    initialValues={{ email: '' }}
                                    displayName="ForgotPassword"
                                    validationSchema={forgotPasswordSchema}
                                    onSubmit={(values, actions) => {
                                        Axios.post('/api/users/password/send-reset-link', values)
                                            .then(() => {
                                                setError('');
                                                setSuccess('An email has been sent with further information.');
                                                actions.resetForm();
                                            })
                                            .catch(error => {
                                                setSuccess('');
                                                setError(typeof error.response.data === 'string' ?
                                                    error.response.data : error.response.statusText);
                                            })
                                            .finally(() => {
                                                actions.setSubmitting(false);
                                            });
                                    }}
                                >
                                    {formikProps => (
                                        <Form onSubmit={formikProps.handleSubmit} >
                                            <div className="form-group">
                                                <Field className="form-control" data-testid="email" type="email" name="email" placeholder="Email address" autoComplete="username" />
                                                <div className="invalid-feedback" data-testid="email-error" >
                                                    <ErrorMessage id="email-error" name="email" />
                                                </div>
                                            </div>
                                            {success && <Alert type="success" message={success} />}
                                            {error && <Alert type="danger" message={error} />}
                                            <button type="submit" className="btn btn-info btn-block" > Reset Password </button>
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
