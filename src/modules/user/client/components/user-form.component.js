import React, { useEffect } from 'react';
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Form, withFormik, Field, ErrorMessage } from "formik";
import { getCountryList } from '../../../core/client/country.actions';
import { createUser } from "../user.actions";
import { registerSchema } from "../user.schema";

class UserForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            countries: []
        };
    }

    render() {
        const permissionList = [
            { id: 0, value: 'User Management' },
            { id: 1, value: 'HCP Management' },
            { id: 2, value: 'Persona Management' },
            { id: 4, value: 'Email Campaign' }
        ];

        const { handleSubmit, isSubmitting } = this.props;

        return (
            <div className="container">
                <div className="row">
                    <div className="col-lg-5 col-md-8 col-12 my-4 mx-auto p-0 shadow border bg-white">
                        <div className="p-3 bg-light h5 rounded-top">Create new site admin</div>
                        <div className="card-body">
                            <Form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <Field data-testid="name" className="form-control" type="name" name="name" placeholder="Name" />
                                    <div className="invalid-feedback" data-testid="nameError"><ErrorMessage name="name" /></div>
                                </div>
                                <div className="form-group">
                                    <Field data-testid="email" className="form-control" type="email" name="email" placeholder="Email address" autoComplete="username" />
                                    <div className="invalid-feedback" data-testid="emailError"><ErrorMessage name="email" /></div>
                                </div>
                                <div className="form-group">
                                    <Field data-testid="password" className="form-control" type="password" name="password" placeholder="Password" autoComplete="current-password" />
                                    <div className="invalid-feedback" data-testid="passwordError"><ErrorMessage name="password" /></div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="country">Select Countries:</label>
                                    <Field data-testid="country" as="select" name="countries" className="form-control" multiple>
                                        {(this.state.countries).map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
                                    </Field>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="permissions">Grant Permissions:</label>
                                    <Field data-testid="permission" as="select" name="permissions" className="form-control" multiple>
                                        {permissionList.map(item => <option key={item.id} value={item.value}>{item.value}</option>)}
                                    </Field>
                                </div>
                                <div className="form-group">
                                    <Field data-testid="phone" className="form-control" type="text" name="phone" placeholder="Phone" />
                                    <div className="invalid-feedback">
                                        <ErrorMessage name="phone" data-testid="phoneError" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <Field type="checkbox" name="is_active" data-testid="is_active" /> Is Active
                                </div>
                                <button type="submit" className="btn btn-info btn-block" disabled={isSubmitting}>Submit</button>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    componentDidMount() {
        this.props.getCountryList()
            .then(res => {
                this.setState({
                    countries: res.value.data
                });
            });
    }
}

UserForm = withFormik({
    enableReinitialize: true,

    validationSchema: registerSchema,

    mapPropsToValues: () => {
        return {
            name: "",
            email: "",
            password: "",
            countries: [],
            permissions: [],
            phone: "",
            is_active: false
        };
    },

    handleSubmit: (values, { setSubmitting, resetForm, props }) => {
        setSubmitting(false);

        const formData = {
            name: values.name,
            email: values.email,
            password: values.password,
            countries: values.countries,
            permissions: values.permissions,
            phone: values.phone,
            is_active: values.is_active
        };

        props.createUser(formData).then(function () {
            resetForm();
        }).catch(error => {
            console.log(error);
        });
    },

    displayName: "UserForm"
})(UserForm);

const mapDispatchToProps = dispatch => {
    return {
        createUser: formData => dispatch(createUser(formData)),
        getCountryList: () => dispatch(getCountryList())
    };
};

export default withRouter(connect(null, mapDispatchToProps)(UserForm));
