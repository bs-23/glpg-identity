import React from 'react';

const SearchMissingUsers = () => {
    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0 px-sm-3">
                        <div className="shadow-sm bg-light pb-3">
                            <h2 className="d-flex align-items-center p-3 px-sm-3 py-sm-3 page-title light">
                                <span className="page-title__text font-weight-bold">OKLA Serach</span>
                            </h2>
                            <div className="add-user mx-3 mt-0 p-3 bg-white rounded border">
                                <form>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label for="exampleInputEmail1">Countries</label>
                                                <select className="form-control" id="exampleFormControlSelect1">
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                </select>
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
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default SearchMissingUsers;
