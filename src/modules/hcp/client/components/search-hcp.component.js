import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Formik, Field, ErrorMessage } from 'formik';

const SearchHcp = () => {
    const countries = useSelector(state => state.countryReducer.countries);


    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0 px-sm-3">
                        <div className="shadow-sm bg-light pb-3">
                            <h2 className="d-flex align-items-center p-3 px-sm-3 py-sm-3 page-title light">
                                <span className="page-title__text font-weight-bold">OKLA Search</span>
                            </h2>
                            <div className="add-user mx-3 mt-0 p-3 bg-white rounded border">
                            <Formik
                                initialValues={{
                                    names: []
                                }}
                            >
                                { formikProps => (
                                    <Form>
                                        <div className="row">
                                            <div className="col-12">
                                                <div className="form-group">
                                                    <label for="exampleInputEmail1">Countries</label>
                                                    <Field className="form-control" component="select" name="names" multiple={true}
                                                        // // You need to set the new field value
                                                        // onChange={evt =>
                                                        //     setFieldValue(
                                                        //         "names",
                                                        //         [].slice
                                                        //         .call(evt.target.selectedOptions)
                                                        //         .map(option => option.value)
                                                        //     )
                                                        // }
                                                    >
                                                        {
                                                            countries && countries.length && countries.map( (country, idx) => {
                                                                return <option key={idx} value={country.codbase}> { country.codbase_desc } </option>
                                                            })
                                                        }

                                                    </Field>
                                                    <small id="exampleFormControlSelect1" className="form-text text-muted">You may select multiple counties </small>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="custom-control custom-checkbox custom-control-inline my-1 mr-sm-2">
                                                    <input type="checkbox" className="custom-control-input" id="customControlInline" />
                                                    <label className="custom-control-label" for="customControlInline">In My Contract</label>
                                                </div>
                                                <div className="custom-control custom-checkbox custom-control-inline my-1 mr-sm-2">
                                                    <input type="checkbox" className="custom-control-input" id="customControlInline2" />
                                                    <label className="custom-control-label" for="customControlInline2">Phonetic</label>
                                                </div>
                                                <div className="custom-control custom-checkbox custom-control-inline my-1 mr-sm-2">
                                                    <input type="checkbox" className="custom-control-input" id="customControlInline3" />
                                                    <label className="custom-control-label" for="customControlInline3">Duplicates</label>
                                                </div>
                                            </div>
                                        </div>
                                        <h5 className="border-bottom pt-5 pb-2 "><i className="far fa-user cdp-text-secondary mr-2"></i>Individual</h5>
                                        <div className="row">
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label for="exampleFormControlInput1">First Name</label>
                                                    <input type="text" className="form-control" id="firstName" placeholder="" />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label for="exampleFormControlInput1">Last Name</label>
                                                    <input type="text" className="form-control" id="lastName" placeholder="" />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label for="Speciality">Speciality</label>
                                                    <select className="form-control" id="Speciality">
                                                        <option>1</option>
                                                        <option>2</option>
                                                        <option>3</option>
                                                        <option>4</option>
                                                        <option>5</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <h5 className="border-bottom pt-4 pb-2 "><i className="far fa-building cdp-text-secondary mr-2"></i>Workplace</h5>
                                        <div className="row">
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label for="AddressLabel">Address Label</label>
                                                    <input type="text" className="form-control" id="AddressLabel" placeholder="" />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label for="City">City</label>
                                                    <input type="text" className="form-control" id="City" placeholder="" />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label for="PostalCode">Postal Code</label>
                                                    <input type="text" className="form-control" id="PostalCode" placeholder="" />
                                                </div>
                                            </div>
                                        </div>
                                        <h5 className="border-bottom pt-4 pb-2 "><i className="fas fa-key cdp-text-secondary mr-2"></i>Identifiers</h5>
                                        <div className="row">
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label for="OnekeyID">Onekey ID</label>
                                                    <input type="text" className="form-control" id="OnekeyID" placeholder="" />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label for="Individual ">Individual - Identifier</label>
                                                    <input type="text" className="form-control" id="Individual " placeholder="" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-6"><button type="reset" className="btn btn-block btn-secondary mt-4 p-2">CLOSE</button></div>
                                            <div className="col-6"><button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2">SEARCH</button></div>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="my-3">
                            <div className="d-sm-flex justify-content-between align-items-center mb-3 mt-4">
                                <h4 className="cdp-text-primary font-weight-bold mb-3 mb-sm-0">Search Result</h4>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="mr-2"><i className="fas fa-check cdp-text-primary"></i> Valid</span>
                                    <span><i className="fas fa-times cdp-text-secondary"></i> Invalid</span>
                                </div>
                            </div>
                            <div className="table-responsive shadow-sm bg-white">
                                <table className="table table-hover table-sm mb-0 cdp-table">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">
                                        <tr>
                                            <th>Name</th>
                                            <th>Speciality</th>
                                            <th>Workplace</th>
                                            <th>Onekey ID</th>
                                            <th>Individual - Identifier</th>
                                            <th>Conuntry</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        <tr>
                                            <td>David Alian</td>
                                            <td>
                                                <div className="currentWorkplace"><i className="fas fa-check mr-1 cdp-text-primary"></i> IBN sina, Dhaka</div>
                                                <div className="previousWorkplace"><i className="fas fa-times mr-1 cdp-text-secondary"></i> Popular, Dhaka</div>
                                            </td>
                                            <td>Dentist</td>
                                            <td>551255</td>
                                            <td>564564565</td>
                                            <td>Belgium</td>
                                            <td>Detail</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default SearchHcp;
