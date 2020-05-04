import React from "react";
import { Form, withFormik, Field, ErrorMessage } from "formik";

import { createSiteAdmin } from "./user.actions";
import store from "../../core/client/store";
import { registerSchema } from "./user.schema";

export class UserCreate extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isActive: true,
            countries: undefined
        };
    }

    toggleActive(e) {
        this.setState({
            isActive: !this.state.isActive,
        });
    }

    render() {
        const { handleSubmit } = this.props;

        return (
            <div className="container">
                <div className="row">
                    <div className="col-lg-5 col-md-8 col-12 my-4 mx-auto p-0 shadow border bg-white">
                        <div className="p-3 bg-light h5 rounded-top">Create new site admin</div>
                        <div className="card-body">
                            <Form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <Field className="form-control" type="name" name="name" placeholder="Name" autoComplete="username" />
                                    <div className="invalid-feedback"><ErrorMessage name="name" /></div>
                                </div>
                                <div className="form-group">
                                    <Field className="form-control" type="email" name="email" placeholder="Email address" autoComplete="username" />
                                    <div className="invalid-feedback"><ErrorMessage name="email" /></div>
                                </div>
                                <div className="form-group">
                                    <Field className="form-control" type="password" name="password" placeholder="Password" autoComplete="current-password" />
                                    <div className="invalid-feedback"><ErrorMessage name="password" /></div>
                                </div>
                                <div class="form-group">
                                    <label for="country">Select Countries:</label>
                                    <Field as="select" name="countries" className="form-control">
                                        <option value="USA">USA</option>
                                        <option value="UK">UK</option>
                                        <option value="Germany">Germany</option>
                                        <option value="Brazil">Brazil</option>
                                        <option value="Russia">Russia</option>
                                    </Field>
                                </div>
                                <div className="form-group">
                                    <Field className="form-control" type="text" name="phone" placeholder="Phone" autoComplete="username" />
                                    <div className="invalid-feedback"><ErrorMessage name="phone" /></div>
                                </div>

                                <div className="form-group">
                                    <input type="checkbox" aria-label="isActive" name="isActive" onClick={(e) => this.toggleActive(e)} defaultChecked={this.state.isActive} value={this.state.isActive} /> Active
                                </div>
                                <button type="submit" className="btn btn-info btn-block">Submit</button>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

UserCreate = withFormik({
    validationSchema: registerSchema,

    mapPropsToValues: () => {
        return {
            name: "",
            email: "",
            password: "",
            type: "Site Admin",
            countries: "USA",
            phone: "",
            isActive: true

        };
    },

    handleSubmit: (values, { setSubmitting }) => {
        setSubmitting(false);

        store.dispatch(createSiteAdmin({
            name: values.name,
            email: values.email,
            password: values.password,
            countries: values.countries,
            type: values.role,
            phone: values.phone,
            isActive: Boolean(values.isActive)

        })).then(() => {
            window.location = '/';
        }).catch(error => {
            alert(error.response.data);
        });
    },

    displayName: "UserCreate"
})(UserCreate);

export default UserCreate;
