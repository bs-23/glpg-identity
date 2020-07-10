import React from "react";
import { useDispatch } from "react-redux";
import { Form, Formik, Field, ErrorMessage } from "formik";
import { Link } from 'react-router-dom';

import { login } from "../user.actions";
import { loginSchema } from "../user.schema";


export default function Login() {
    const dispatch = useDispatch();

    return (
        <div className="app-login">
            <div className="w-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 col-md-8 col-12 mx-auto">
                            <h1 className="text-center">
                                <img alt="CIAM logo" src="/assets/CIAM-LOGO.png" height="102" />
                            </h1>
                            <h4 className="app-login__header text-center py-3">Welcome to CIAM</h4>
                            <div className="card-body p-4 p-sm-5 border bg-white">
                                <Formik
                                    initialValues={{
                                        email: "",
                                        password: ""
                                    }}
                                    displayName="Login"
                                    validationSchema={loginSchema}
                                    onSubmit={(values, actions) => {
                                        dispatch(login({
                                            email: values.email,
                                            password: values.password
                                        }))
                                        .catch(error => {
                                            alert(error.response.data);
                                        });

                                        actions.setSubmitting(false);
                                    }}
                                >
                                    {formikProps => (
                                        <Form onSubmit={formikProps.handleSubmit}>
                                            <div className="form-group">
                                                <label className="">Email</label>
                                                <Field className="form-control" data-testid="email" type="email" name="email" autoComplete="username" />
                                                <div className="invalid-feedback" data-testid="email-error"><ErrorMessage id="email-error" name="email" /></div>
                                            </div>
                                            <div className="form-group">
                                                <label className="">Password</label>
                                                <Field className="form-control" data-testid="password" type="password" name="password" autoComplete="current-password" />
                                                <div className="invalid-feedback" data-testid="password-error"><ErrorMessage name="password" /></div>
                                            </div>
                                            <button type="submit" className="btn btn-block text-white app-login__btn mt-4 rounded-0">Sign In</button>
                                        </Form>
                                    )}
                                </Formik>
                                <div className="mt-4 text-center">
                                    <Link
                                        to="/forgot-password"
                                        style={{ textDecoration: 'none' }}
                                        className="text-secondary"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
