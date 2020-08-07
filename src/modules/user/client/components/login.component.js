import React from "react";
import { useDispatch } from "react-redux";
import { Form, Formik, Field, ErrorMessage } from "formik";
import { Link } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import ReCAPTCHA from "react-google-recaptcha";
import { useCookies } from 'react-cookie';

import { login } from "../user.actions";
import { loginSchema } from "../user.schema";

export default function Login() {
    const dispatch = useDispatch();
    const { addToast } = useToasts();
    const [cookies, setCookie] = useCookies();

    return (
        <div className="app-login">
            <div className="w-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 col-md-8 col-12 mx-auto">
                            <h1 className="text-center">
                                <img alt="CDP LOGO" src="/assets/CDP.png" height="102" />
                            </h1>
                            <h4 className="app-login__header text-center py-3">Welcome to CDP</h4>
                            <div className="card-body p-4 p-sm-5 border bg-white">
                            <Formik
                                    initialValues={{
                                        email: "",
                                        password: "",
                                        recaptchaToken: ""
                                    }}
                                    displayName="Login"
                                    validationSchema={loginSchema}
                                    onSubmit={(values, actions) => {
                                        dispatch(login({
                                            email: values.email,
                                            password: values.password,
                                            recaptchaToken: values.recaptchaToken
                                        }))
                                        .then( response => {
                                            setCookie('logged_in', true, { path: '/' });
                                        })
                                        .catch(error => {
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
                                                <label className="">Email</label>
                                                <Field className="form-control" data-testid="email" type="email" name="email" autoComplete="username" />
                                                <div className="invalid-feedback" data-testid="email-error"><ErrorMessage id="email-error" name="email" /></div>
                                            </div>
                                            <div className="form-group">
                                                <label className="">Password</label>
                                                <Field className="form-control" data-testid="password" type="password" name="password" autoComplete="current-password" />
                                                <div className="invalid-feedback" data-testid="password-error"><ErrorMessage name="password" /></div>
                                            </div>

                                            <div className="form-group">
                                                <ReCAPTCHA
                                                    sitekey={process.env.RECAPTCHA_SITE_KEY}
                                                    testprops={formikProps}
                                                    data-testid="captcha"
                                                    onChange={
                                                        (response) => {
                                                            formikProps.setFieldValue("recaptchaToken", response);
                                                        }
                                                    }
                                                />
                                                {formikProps.errors.recaptchaToken && formikProps.touched.recaptchaToken && (
                                                    <div className="invalid-feedback">{formikProps.errors.recaptchaToken}</div>
                                                )}
                                            </div>

                                            <button type="submit" className="btn btn-block text-white app-login__btn mt-4 p-2">Sign In</button>
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
