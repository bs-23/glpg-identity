import React from 'react';
import { useCookies } from 'react-cookie';
import { useToasts } from 'react-toast-notifications';
import { Form, Formik, Field } from 'formik';
import Axios from 'axios';

export default function SwaggerLogin() {
    const { addToast } = useToasts();
    const [, setCookie] = useCookies();

    return (
        <div className="app-login">
            <div className="w-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 col-md-8 col-12 mx-auto">
                            <h1 className="text-center">
                                <img alt="CDP LOGO" src="/assets/CDP.png" height="102" />
                            </h1>
                            <h3 className="app-login__header text-center py-3">Welcome to CDP Documentation</h3>
                            <div className="card-body p-4 p-sm-5 border bg-white">
                                <Formik
                                    initialValues={{
                                        password: "",
                                    }}
                                    displayName="Swagger Login"
                                    onSubmit={(values, actions) => {
                                        Axios.post('/swagger/login', values).then(() => {
                                            setCookie('logged_in_swagger', true, { path: '/' });
                                            location.href = '/api-docs'
                                        }).catch(error => {
                                            addToast(error.response.data, {
                                                appearance: 'error',
                                                autoDismiss: true
                                            });
                                        });

                                        actions.setSubmitting(false);
                                    }}
                                >
                                    {formikProps => (
                                        <Form onSubmit={formikProps.handleSubmit}>
                                            <div className="form-group">
                                                <label className="label-style">Password <span className="text-danger">*</span></label>
                                                <Field className="form-control" data-testid="password" type="password" name="password" autoComplete="current-password" />
                                            </div>

                                            <button type="submit" className="btn btn-block text-white app-login__btn mt-4 p-2 font-weight-bold">Login</button>
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
