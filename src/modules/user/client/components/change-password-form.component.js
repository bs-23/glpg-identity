import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Form, withFormik, Field, ErrorMessage } from 'formik';

import { changePassword } from '../user.actions';
import { changePasswordSchema } from '../user.schema';

class ChangePasswordForm extends React.Component {
    render() {
        const { handleSubmit, isSubmitting } = this.props;

        return (
            <div className="container">
                <div className="row">
                    <div className="col-lg-5 col-md-8 col-12 my-4 mx-auto p-0 shadow border bg-white">
                        <div className="p-3 bg-light h5 rounded-top">
                            Change Password
                        </div>
                        <div className="card-body">
                            <Form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <Field
                                        className="form-control"
                                        type="password"
                                        name="currentPassword"
                                        placeholder="Current Password"
                                        data-testid="currentPassword"
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
                                    />
                                    <div className="invalid-feedback" data-testid="confirmPasswordError">
                                        <ErrorMessage name="confirmPassword" />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-info btn-block"
                                    disabled={isSubmitting}
                                >
                                    Submit
                                </button>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ChangePasswordForm = withFormik({
    enableReinitialize: true,

    validationSchema: changePasswordSchema,

    mapPropsToValues: () => ({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    }),

    handleSubmit: (values, { setSubmitting, resetForm, props }) => {
        setSubmitting(false);

        const formData = {
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
        };

        props
            .changePassword(formData)
            .then(function(data) {
                console.log('Change password returned data', data);
                resetForm();
            })
            .catch(error => {
                console.log('Change Password Error', error);
                alert(error.response.data);
            });
    },

    displayName: 'ChangePasswordForm',
})(ChangePasswordForm);

const mapDispatchToProps = dispatch => ({
    changePassword: formData => dispatch(changePassword(formData)),
});

export default withRouter(
    connect(null, mapDispatchToProps)(ChangePasswordForm)
);
