import React, { useEffect } from 'react';
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { NavLink } from 'react-router-dom';
import { Form, withFormik, Field, ErrorMessage } from "formik";
import { getCountryList } from '../../../core/client/actions/country.actions';
import { createUser } from "../user.actions";
import { registerSchema } from "../user.schema";
import { useSelector } from 'react-redux';
import Dropdown from 'react-bootstrap/Dropdown';
import Breadcrumb from 'react-bootstrap/Breadcrumb';

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
            <main>
                <header className="app__header bg-success py-2">
                    <div className="container-fluid">
                        <div className="row align-items-center">
                            <div className="col-12 col-sm-6">
                                <div className="d-flex">
                                    <h1 className="mb-0 text-white mr-5">CDP</h1>
                                    <Dropdown>
                                        <Dropdown.Toggle variant="secondary" id="dropdown-basic" className="mt-2">
                                            Service
                                    </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item href="/users">User and Permission Service</Dropdown.Item>
                                            <Dropdown.Item href="#/action-2">Form Data Service</Dropdown.Item>
                                            <Dropdown.Item href="#/action-3">Tag and Persona Service</Dropdown.Item>
                                            <Dropdown.Item href="#/action-4">HCP Service</Dropdown.Item>
                                            <Dropdown.Item href="#/action-5">Campaign Service</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 text-right">
                                <h6 className="mr-3 mb-0 text-white d-inline-block"></h6><a className="btn btn-danger" href="/logout">Logout</a>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="app__content">
                    <Breadcrumb>
                        <Breadcrumb.Item href="/">
                            Dashboard
                        </Breadcrumb.Item>
                        <Breadcrumb.Item href="/users">
                            User and Permission Service
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active>Add new</Breadcrumb.Item>
                    </Breadcrumb>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12">
                                <div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h2 className="mb-3">Create new user</h2>
                                    </div>
                                    <div className="row">
                                        <div className="col-12 col-sm-6">
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

                        </div>
                    </div>
                </div>
            </main>
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
