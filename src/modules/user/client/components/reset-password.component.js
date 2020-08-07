import React from 'react';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import Axios from 'axios';
import { useHistory, useLocation } from 'react-router-dom';
import QueryString from 'query-string';
import { useToasts } from 'react-toast-notifications';

import { resetPasswordSchema } from '../user.schema';


export default function ResetPasswordForm() {
    const history = useHistory();
    const location = useLocation();
    const { token } = QueryString.parse(location.search);
    const { addToast } = useToasts();

    return (
        <div className="app-login">
            <div className="w-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 col-md-8 col-12 mx-auto">
                            <h1 className="text-center">
                                <a href="/login"><img alt="CDP LOGO" src="/assets/CDP.png" height="102" /></a>
                            </h1>
                            <h3 className="app-login__header text-center py-3">Reset Password</h3>
                            <div className="card-body p-4 p-sm-5 border bg-white">
                                <Formik
                                    initialValues={{
                                        newPassword: '',
                                        confirmPassword: '',
                                    }}
                                    displayName="ResetPasswordForm"
                                    validationSchema={resetPasswordSchema}
                                    onSubmit={(values, actions) => {
                                        Axios.put(`/api/users/reset-password?token=${token}`, values)
                                            .then(() => {
                                                addToast('Your password has been reset successfully. Redirecting...', {
                                                    appearance: 'success',
                                                    autoDismiss: true
                                                });
                                                setTimeout(() => {
                                                    history.replace('/login');
                                                }, 2000);
                                                actions.setSubmitting(false);
                                            })
                                            .catch(err => {
                                                const errorMessage = typeof err.response.data === 'string' ? err.response.data : err.response.statusText
                                                addToast(errorMessage, {
                                                    appearance: 'error',
                                                    autoDismiss: true
                                                });
                                                actions.setSubmitting(false);
                                            });
                                    }}
                                >
                                    {formikProps => (
                                        <Form onSubmit={formikProps.handleSubmit}>
                                            <Field type="text" name="username" autoComplete="username" hidden />
                                            <div className="form-group">
                                                <label className="label-style">New Password<span className="text-danger required-field pl-1">*</span></label>
                                                <Field
                                                    className="form-control"
                                                    type="password"
                                                    name="newPassword"
                                                    data-testid="newPassword"
                                                    autoComplete="new-password"
                                                />
                                                <div className="invalid-feedback" data-testid="newPasswordError">
                                                    <ErrorMessage name="newPassword" />
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label className="label-style">Re-enter New Password<span className="text-danger required-field pl-1">*</span></label>
                                                <Field
                                                    className="form-control"
                                                    type="password"
                                                    name="confirmPassword"
                                                    autoComplete="current-password"
                                                    data-testid="confirmPassword"
                                                    autoComplete="new-password"
                                                />
                                                <div className="invalid-feedback" data-testid="confirmPasswordError" >
                                                    <ErrorMessage name="confirmPassword" />
                                                </div>
                                            </div>

                                            <button type="submit" className="btn btn-block text-white app-login__btn mt-4 p-2 font-weight-bold" disabled={formikProps.isSubmitting} >
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
