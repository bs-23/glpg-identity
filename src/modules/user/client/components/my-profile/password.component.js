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
        dispatch(clearLoggedInUser());
        axios.get('/api/logout');
        removeCookie('logged_in', { path: '/' });
        history.replace('/');
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
            <h4>Change Password</h4>

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
