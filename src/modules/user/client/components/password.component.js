import React from 'react';
import { useDispatch } from 'react-redux';
import { Form, Formik, Field, ErrorMessage } from 'formik';

import { changePassword } from '../user.actions';
import { changePasswordSchema } from '../user.schema';

export default function ChangePasswordForm() {
    const dispatch = useDispatch();

    return (
        <div className="container">
            <h3>Change Password</h3>

            <Formik
                initialValues={{
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }}
                displayName="ChangePassword"
                validationSchema={changePasswordSchema}
                onSubmit={(values, actions) => {
                    dispatch(changePassword(values));
                    actions.resetForm();

                    actions.setSubmitting(false);
                }}
            >
                {formikProps => (
                    <Form onSubmit={formikProps.handleSubmit}>
                        <div className="form-group">
                            <Field
                                className="form-control"
                                type="text"
                                name="username"
                                placeholder="Username"
                                data-testid="username"
                                autoComplete="username"
                                hidden
                            />
                            <Field
                                className="form-control"
                                type="password"
                                name="currentPassword"
                                placeholder="Current Password"
                                data-testid="currentPassword"
                                autoComplete="current-password"
                            />
                            <div className="invalid-feedback" data-testid="currentPasswordError">
                                <ErrorMessage name="currentPassword" />
                            </div>
                        </div>

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
                            <div className="invalid-feedback" data-testid="confirmPasswordError">
                                <ErrorMessage name="confirmPassword" />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-info" disabled={formikProps.isSubmitting}>
                            Submit
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
