import React from 'react';
import { useDispatch } from 'react-redux';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import { useToasts } from 'react-toast-notifications';
import axios from 'axios';
import { useCookies } from 'react-cookie';

import { changePassword, clearLoggedInUser } from '../../user.actions';
import { changePasswordSchema } from '../../user.schema';
import { useHistory } from 'react-router-dom';

export default function ChangePasswordForm() {
    const dispatch = useDispatch();
    const history = useHistory();
    const { addToast } = useToasts();
    const [, , removeCookie] = useCookies();

    const timeBeforeLogout = 3000;

    const handleLogout = () => {
        axios.get('/api/logout');
        dispatch(clearLoggedInUser());
        removeCookie('logged_in', { path: '/' });
        window.location = "/";
    }

    const formSubmitHandler = async (values, actions) => {
        actions.setSubmitting(true);
        try{
            await dispatch(changePassword(values));
            addToast('Password changed successfully. Logging out the user.', {
                appearance: 'success',
                autoDismiss: true
            });
            setTimeout(() => {
                handleLogout();
            }, timeBeforeLogout);
        }catch(err){
            const errorMessage = typeof err.response.data === 'string'
                ? err.response.data
                : err.response.statusText;
            addToast(errorMessage, {
                appearance: 'error',
                autoDismiss: true
            });
        }finally{
            actions.setSubmitting(false);
            actions.resetForm();
        }
    }

    return (
        <div className="my-2">
            <h4 className="border-bottom pb-3 pt-2">Change Password</h4>

            <Formik
                initialValues={{
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }}
                displayName="ChangePassword"
                validationSchema={changePasswordSchema}
                onSubmit={formSubmitHandler}
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
                            <label className="font-weight-bold" htmlFor="currentPassword">Current Password <span className="text-danger">*</span></label>
                            <Field
                                className="form-control"
                                type="password"
                                name="currentPassword"
                                data-testid="currentPassword"
                                autoComplete="current-password"
                            />
                            <div className="invalid-feedback" data-testid="currentPasswordError">
                                <ErrorMessage name="currentPassword" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="font-weight-bold" htmlFor="newPassword">New Password <span className="text-danger">*</span></label>
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
                            <label className="font-weight-bold" htmlFor="confirmPassword">Confirm Password <span className="text-danger">*</span></label>
                            <Field
                                className="form-control"
                                type="password"
                                name="confirmPassword"
                                autoComplete="current-password"
                                data-testid="confirmPassword"
                                autoComplete="new-password"
                            />
                            <div className="invalid-feedback" data-testid="confirmPasswordError">
                                <ErrorMessage name="confirmPassword" />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" disabled={formikProps.isSubmitting}>
                            Submit
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
