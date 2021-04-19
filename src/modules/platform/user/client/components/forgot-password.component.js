import React from 'react';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import { useToasts } from 'react-toast-notifications';

import { forgotPasswordSchema } from '../user.schema';

import Axios from 'axios';


export default function ForgotPassword() {
    const { addToast } = useToasts();

    return (
        <div className="app-login">
            <div className="w-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 col-md-8 col-12 mx-auto">
                            <h1 className="text-center mb-3 mb-sm-5">
                                <a href="/login"><img alt="CDP LOGO" src="/assets/CDP2x.png" height="102" /></a>
                            </h1>
                            <h3 className="app-login__header text-center py-3">Forgot Password</h3>

                            <div className="card-body p-4 p-sm-5 border bg-white">
                                <p className="cdp-text-light pb-4">
                                    Please enter your email address and we will send you a link to reset your password
                                </p>
                                <Formik
                                    initialValues={{ email: '' }}
                                    displayName="ForgotPassword"
                                    validationSchema={forgotPasswordSchema}
                                    onSubmit={(values, actions) => {
                                        Axios.post('/api/users/forgot-password', values)
                                            .then((response) => {
                                                addToast(response.data.message, {
                                                    appearance: 'success',
                                                    autoDismiss: true
                                                });
                                                actions.resetForm();
                                            })
                                            .catch(err => {
                                                const errorMessage = typeof err.response.data === 'string' ? err.response.data : err.response.statusText
                                                addToast(errorMessage, {
                                                    appearance: 'error',
                                                    autoDismiss: true
                                                });
                                            })
                                            .finally(() => {
                                                actions.setSubmitting(false);
                                            });
                                    }}
                                >
                                    {formikProps => (
                                        <Form onSubmit={formikProps.handleSubmit} >
                                            <div className="form-group">
                                                <label className="label-style">Email Address<span className="text-danger required-field pl-1">*</span></label>
                                                <Field className="form-control" data-testid="email" type="email" name="email" placeholder="Email address" autoComplete="username" />
                                                <div className="invalid-feedback" data-testid="email-error" >
                                                    <ErrorMessage id="email-error" name="email" />
                                                </div>
                                            </div>
                                            <button type="submit" className="btn btn-block text-white app-login__btn mt-4 p-2 font-weight-bold" >Send </button>
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
