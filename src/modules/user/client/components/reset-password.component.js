import React from 'react';
import Axios from 'axios';
import QueryString from 'query-string';
import { useToasts } from 'react-toast-notifications';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import { useHistory, useLocation } from 'react-router-dom';

import { resetPasswordSchema } from '../user.schema';

export default function ResetPasswordForm() {
    const history = useHistory();
    const location = useLocation();
    const { token } = QueryString.parse(location.search);
    const { addToast } = useToasts();

    const popoverTop = (
        <Popover id="popover-basic" className="popup-customize">
            <Popover.Title as="h3" className=" pt-4 px-3">Password must meet the following requirements</Popover.Title>
            <Popover.Content className=" px-3">
                <ul className="list-unstyled">
                    <li><i className="fas fa-circle"></i>A minimum of 8 characters and a maximum of 50 characters</li>
                    <li><i className="fas fa-circle"></i>At least one lowercase character (a - z)</li>
                    <li><i className="fas fa-circle"></i>At least one uppercase character (A - Z)</li>
                    <li><i className="fas fa-circle"></i>At least one number (0-9)</li>
                    <li><i className="fas fa-circle"></i>At least one special character ({`!”#$%&’()*+,-./:;<=>?@[\\\]^_{|}~`})</li>
                    <li><i className="fas fa-circle"></i>Common words and data related to your identity (e.g. name, email) are not allowed</li>
                </ul>
            </Popover.Content>
        </Popover>
    );

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
                                        confirmPassword: ''
                                    }}
                                    displayName="ResetPasswordForm"
                                    validationSchema={resetPasswordSchema}
                                    onSubmit={(values, actions) => {
                                        Axios.put(`/api/users/reset-password?token=${token}`, values).then(() => {
                                            addToast('Your password has been reset successfully. Redirecting...', {
                                                appearance: 'success',
                                                autoDismiss: true
                                            });
                                            setTimeout(() => {
                                                history.replace('/login');
                                            }, 2000);
                                            actions.setSubmitting(false);
                                        }).catch(err => {
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
                                            <Field type="text" name="username" autoComplete="username" hidden/>
                                            <div className="form-group">
                                                <label className="label-style">New Password<span className="text-danger required-field pl-1">*</span></label>

                                                <OverlayTrigger trigger="click" placement="top" overlay={popoverTop}>
                                                    <i class="fas fa-info-circle ml-2 cdp-text-primary" role="button"></i>
                                                </OverlayTrigger>

                                                <Field
                                                    className="form-control"
                                                    type="password"
                                                    name="newPassword"
                                                    data-testid="newPassword"
                                                    autoComplete="new-password"
                                                />
                                                <div className="invalid-feedback" data-testid="newPasswordError">
                                                    <ErrorMessage name="newPassword"/>
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
                                                <div className="invalid-feedback" data-testid="confirmPasswordError">
                                                    <ErrorMessage name="confirmPassword"/>
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
