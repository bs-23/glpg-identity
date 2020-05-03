import React from "react";
import { Form, withFormik, Field, ErrorMessage } from "formik";

import store from "../../core/client/store";
import { login } from "./user.actions";
import { loginSchema } from "./user.schema";

class Login extends React.Component {
    render() {
        const { handleSubmit } = this.props;

        return (
            <div className="container">
                <div className="col-lg-5 col-md-8 col-12 mx-auto p-0 shadow border bg-white">
                    <div className="p-3 bg-light h5 rounded-top">Log-in to your account</div>
                    <div className="card-body">
                        <Form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <Field className="form-control" type="email" name="email" placeholder="Email address" autoComplete="username" />
                                <div className="invalid-feedback"><ErrorMessage name="email" /></div>
                            </div>
                            <div className="form-group">
                                <Field className="form-control" type="password" name="password" placeholder="Password" autoComplete="current-password" />
                                <div className="invalid-feedback"><ErrorMessage name="password" /></div>
                            </div>
                            <button type="submit" className="btn btn-info btn-block">Submit</button>
                        </Form>
                    </div>
                </div>
            </div>
        );
    };
}

Login = withFormik({
    validationSchema: loginSchema,

    mapPropsToValues: () => {
        return {
            email: "",
            password: ""
        };
    },

    handleSubmit: (values, { setSubmitting }) => {
        setSubmitting(false);

        store.dispatch(login({
            email: values.email,
            password: values.password
        })).catch(error => {
            alert(error.response.data);
        });
    },

    displayName: "Login"
})(Login);

export default Login;
