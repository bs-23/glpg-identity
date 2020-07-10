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
                        <div className="col-lg-6 col-md-8 col-12 mx-auto">
                            <h1 className="text-center">
                                <a href="/login"><img alt="CIAM logo" src="/assets/CIAM-LOGO.png" height="102" /></a>
                            </h1>
                            <h4 className="app-login__header text-center py-3">Forgot Password</h4>
                           
                            <div className="card-body p-4 p-sm-5 border bg-white">
                                <p className="text-muted">
                                    Please enter the email you used at the time of
                                    registration to get the password reset
                                    instruction
                            </p>
                                <Formik
                                    initialValues={{ email: '' }}
                                    displayName="ForgotPassword"
                                    validationSchema={forgotPasswordSchema}
                                    onSubmit={(values, actions) => {
                                        Axios.post('/api/users/forgot-password', values)
                                            .then(() => {
                                                setError('');
                                                setSuccess('An email has been sent with further information.');
                                                actions.resetForm();
                                            })
                                            .catch(err => {
                                                setSuccess('');
                                                setError(typeof err.response.data === 'string' ?
                                                    err.response.data : err.response.statusText);
                                            })
                                            .finally(() => {
                                                actions.setSubmitting(false);
                                            });
                                    }}
                                >
                                    {formikProps => (
                                        <Form onSubmit={formikProps.handleSubmit} >
                                            <div className="form-group">
                                                <label className="">Email Address</label>
                                                <Field className="form-control" data-testid="email" type="email" name="email" placeholder="Email address" autoComplete="username" />
                                                <div className="invalid-feedback" data-testid="email-error" >
                                                    <ErrorMessage id="email-error" name="email" />
                                                </div>
                                            </div>
                                            {success && <Alert type="success" message={success} />}
                                            {error && <Alert type="danger" message={error} />}
                                            <button type="submit" className="btn btn-info btn-block text-white app-login__btn mt-4 rounded-0" > Reset Password </button>
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
