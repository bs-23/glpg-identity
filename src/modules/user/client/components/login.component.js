import React from "react";
import { useDispatch } from "react-redux";
import { Form, Formik, Field, ErrorMessage } from "formik";

import { login } from "../user.actions";
import { loginSchema } from "../user.schema";

import "./user.scss";

export default function Login() {
    const dispatch = useDispatch();

    return (
        <div className="app-login">
            <div className="w-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-5 col-md-8 col-12 mx-auto p-0 shadow border bg-white">
                            <div className="p-3 bg-light h5 rounded-top">Log-in to your account</div>
                            <div className="card-body">
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
                                        })).catch(error => {
                                            alert(error.response.data);
                                        });

                                        actions.setSubmitting(false);
                                    }}
                                >
                                    {formikProps => (
                                        <Form onSubmit={formikProps.handleSubmit}>
                                            <div className="form-group">
                                                <Field className="form-control" data-testid="email" type="email" name="email" placeholder="Email address" autoComplete="username" />
                                                <div className="invalid-feedback" data-testid="email-error"><ErrorMessage id="email-error" name="email" /></div>
                                            </div>
                                            <div className="form-group">
                                                <Field className="form-control" data-testid="password" type="password" name="password" placeholder="Password" autoComplete="current-password" />
                                                <div className="invalid-feedback" data-testid="password-error"><ErrorMessage name="password" /></div>
                                            </div>
                                            <button type="submit" className="btn btn-info btn-block">Submit</button>
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
