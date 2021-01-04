import { NavLink, useLocation, useHistory } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCrdlpHcpProfiles } from '../hcp.actions';
import Modal from 'react-bootstrap/Modal';
import Faq from '../../../../platform/faq/client/faq.component';
import { HCPFilter } from '../../../../information';

export default function CrdlpHcpProfiles() {
    const dispatch = useDispatch();
    const location = useLocation();
    const history = useHistory();

    const [codBase, setCodBase] = useState(null);
    const [sort, setSort] = useState({ type: 'asc', value: null });
    const [profileDetails, setProfileDetails] = useState(null);
    const [showFaq, setShowFaq] = useState(false);
    const [isFilterEnabled, setIsFilterEnabled] = useState(false);
    const [showFilterSidebar, setShowFilterSidebar] = useState(false);
    const [selectedFilterSetting, setSelectedFilterSetting] = useState(null);
    const hcpFilterRef = useRef();

    const hcpUsers = useSelector(state => state.hcpReducer.crdlpHcps);
    const countries = useSelector(state => state.countryReducer.countries);
    const allCountries = useSelector(state => state.countryReducer.allCountries);
    const params = new URLSearchParams(window.location.search);

    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);

    useEffect(() => {
        setCodBase(params.get('codbase') ? params.get('codbase') : null);
        dispatch(getCrdlpHcpProfiles(location.search));
        setSort({ type: params.get('orderType') || 'asc', value: params.get('orderBy') });
    }, [location]);

    const urlChange = (pageNo, country_codbase, orderColumn, pageChange = false) => {
        let orderType = params.get('orderType');
        const orderBy = params.get('orderBy');
        const page = pageNo ? pageNo : (params.get('page') ? params.get('page') : 1);
        const codbase = country_codbase ? country_codbase : params.get('codbase');

        if (!pageChange) {
            if (orderBy && !orderType) {
                orderType = 'asc'
            }

            (orderBy === orderColumn)
                ? (orderType === 'asc'
                    ? orderType = 'desc'
                    : orderType = 'asc')
                : orderType = 'asc';
        }

        const url = `?page=${page}`
            + (codbase && codbase !== 'null' ? `&codbase=${codbase}` : '')
            + (orderColumn && orderColumn !== 'null' ? `&orderBy=${orderColumn}` : '')
            + (orderColumn && orderType && orderType !== 'null' ? `&orderType=${orderType}` : '');

        history.push(location.pathname + url);
    };

    const pageLeft = () => {
        if (hcpUsers.page > 1) urlChange(hcpUsers.page - 1, hcpUsers.codBase, params.get('orderBy'), true);
    };

    const pageRight = () => {
        if (hcpUsers.end !== hcpUsers.total) urlChange(hcpUsers.page + 1, hcpUsers.codBase, params.get('orderBy'), true);
    };

    const getCountryName = (country_iso2) => {
        if (!allCountries || !country_iso2) return null;
        const country = allCountries.find(c => c.country_iso2.toLowerCase() === country_iso2.toLowerCase());
        return country && country.countryname;
    };

    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/information">Information Management</NavLink></li>
                                <li className="breadcrumb-item active"><span>HCP Profile List</span></li>
                                <li className="ml-auto mr-3"><i type="button" onClick={handleShowFaq} className="icon icon-help icon-2x cdp-text-secondary"></i></li>
                            </ol>

                            <Modal show={showFaq} onHide={handleCloseFaq} size="lg" centered>
                                <Modal.Header closeButton>
                                    <Modal.Title>Questions You May Have</Modal.Title>
                                </Modal.Header>
                                <Modal.Body className="faq__in-modal"><Faq topic="manage-hcp" /></Modal.Body>
                            </Modal>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="d-sm-flex justify-content-between align-items-end mt-4">
                            <div>
                                <h4 className="cdp-text-primary font-weight-bold mb-0 mr-sm-4 mr-1 pb-2">List of HCP User</h4>
                                <div>
                                    <NavLink className="custom-tab px-3 py-3 cdp-border-primary" to="/information/list/cdp">Customer Data Platform</NavLink>
                                    <div className="custom-tab px-3 py-3 cdp-border-primary active">CRDLP</div>
                                </div>
                            </div>
                            <div className="d-flex pt-3 pt-sm-0 mb-2">
                                <button className={`btn cdp-btn-outline-primary ${isFilterEnabled ? 'multifilter_enabled' : ''}`} onClick={() => setShowFilterSidebar(true)} >
                                    <i className={`fas fa-filter  ${isFilterEnabled ? '' : 'mr-2'}`}></i>
                                    <i className={`fas fa-database ${isFilterEnabled ? 'd-inline-block filter__sub-icon mr-1' : 'd-none'}`}></i>
                                    Filter
                                </button>
                                {/*<button className={`btn cdp-btn-outline-primary ${isFilterEnabled ? 'multifilter_enabled' : ''}`} onClick={() => setShowFilterSidebar(true)} ><i class="fas fa-filter mr-2"></i> Filter</button>
                                 {isFilterEnabled && <button className="btn cdp-btn-outline-primary mr-3" onClick={resetFilter} ><i class="fas fa-filter mr-2"></i> Reset Filter </button>} */}
                            </div>
                        </div>

                        {hcpUsers['users'] && hcpUsers['users'].length > 0 &&
                            <React.Fragment>
                                <div className="table-responsive shadow-sm bg-white">
                                    <table className="table table-hover table-sm mb-0 cdp-table">
                                        <thead className="cdp-bg-primary text-white cdp-table__header">
                                            <tr>
                                                <th width="20%"><span className={sort.value === 'firstname' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(null, codBase, 'firstname')}>First Name<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>

                                                <th width="20%"><span className={sort.value === 'lastname' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(null, codBase, 'lastname')}>Last Name<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>

                                                <th width="4%"><span className={sort.value === 'ind_status_desc' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(null, codBase, 'ind_status_desc')}>Status<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>

                                                <th width="13%"><span className={sort.value === 'uuid_1' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(null, codBase, 'uuid_1')}>UUID<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>

                                                <th width="13%"><span className={sort.value === 'individual_id_onekey' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(null, codBase, 'individual_id_onekey')}>Onekey ID<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>

                                                <th width="10%"><span className={sort.value === 'country_iso2' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(null, codBase, 'country_iso2')}>Country<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>

                                                <th width="10%">Specialty</th>

                                                <th width="10%">Phone</th>

                                                <th width="10%">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="cdp-table__body bg-white">
                                            {hcpUsers.users.map((row, idx) => (
                                                <tr key={'user-' + idx}>
                                                    <td className="text-break">{row.firstname}</td>
                                                    <td className="text-break">{row.lastname}</td>
                                                    <td>
                                                        <i className={`fa fa-xs fa-circle ${(row.ind_status_desc || '').toLowerCase() === 'valid' ? 'text-success' : 'text-danger'} pr-2 hcp-status-icon`}></i>
                                                        {row.ind_status_desc}
                                                    </td>
                                                    <td className="text-break">{row.uuid_1 || '--'}</td>
                                                    <td className="text-break">{row.individual_id_onekey || '--'}</td>
                                                    <td>{getCountryName(row.country_iso2)}</td>
                                                    <td>{(row.specialties || []).map(s => s.description).join(', ')}</td>
                                                    <td className="text-break">{row.telephone || '--'}</td>
                                                    <td>
                                                        <button className="btn cdp-btn-outline-primary btn-sm" onClick={() => setProfileDetails(row)}><i class="icon icon-user mr-2" ></i>Profile</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {((hcpUsers.page === 1 &&
                                        hcpUsers.total > hcpUsers.limit) ||
                                        (hcpUsers.page > 1))
                                        && hcpUsers['users'] &&
                                        <div className="pagination justify-content-end align-items-center border-top p-3">
                                            <span className="cdp-text-primary font-weight-bold">{hcpUsers.start + ' - ' + hcpUsers.end}</span> <span className="text-muted pl-1 pr-2"> {' of ' + hcpUsers.total}</span>
                                            <span className="pagination-btn" onClick={() => pageLeft()} disabled={hcpUsers.page <= 1}><i className="icon icon-arrow-down ml-2 prev"></i></span>
                                            <span className="pagination-btn" onClick={() => pageRight()} disabled={hcpUsers.end === hcpUsers.total}><i className="icon icon-arrow-down ml-2 next"></i></span>
                                        </div>
                                    }
                                </div>
                            </React.Fragment>
                        }

                        {hcpUsers['users'] && hcpUsers['users'].length === 0 &&
                            <div className="row justify-content-center mt-sm-5 pt-5 mb-3">
                                <div className="col-12 col-sm-6 py-4 bg-white shadow-sm rounded text-center">
                                    <i className="icon icon-team icon-6x cdp-text-secondary"></i>
                                    <h3 className="font-weight-bold cdp-text-primary pt-4">No Profile Found!</h3>
                                </div>
                            </div>
                        }

                        <Modal
                            size="lg"
                            show={!!profileDetails}
                            onHide={() => { setProfileDetails(null) }}
                            dialogClassName="modal-customize mw-75"
                            aria-labelledby="example-custom-modal-styling-title"
                            centered
                        >
                            <Modal.Header closeButton>
                                <Modal.Title id="example-custom-modal-styling-title">
                                    Profile Details
                                    </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {
                                    profileDetails &&
                                    <div className="px-4 py-3">
                                        <div className="row">
                                            <div className="col">
                                                <h4 className="mt-1 font-weight-bold">{`${profileDetails.ind_prefixname_desc || ''} ${profileDetails.firstname || ''} ${profileDetails.lastname || ''}`}</h4>
                                                <div>{(profileDetails.specialties || []).map(s => s.description).join(', ')}</div>
                                            </div>
                                        </div>
                                        <div className="row mt-3">

                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Gender</div>
                                                <div className="">{profileDetails.gender_desc || '--'}</div>
                                            </div>
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Professional Type</div>
                                                <div className="">{profileDetails.ind_type_desc || '--'}</div>
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">UUID</div>
                                                <div className="">{profileDetails.uuid_1 || '--'}</div>
                                            </div>
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">OneKeyID</div>
                                                <div className="">{profileDetails.individual_id_onekey || '--'}</div>
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Phone Number</div>
                                                <div className="">{profileDetails.telephone || '--'}</div>
                                            </div>
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Fax</div>
                                                <div className="text-capitalize">{profileDetails.fax || '--'}</div>
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Country</div>
                                                <div className="">{getCountryName(profileDetails.country_iso2) || '--'}</div>
                                            </div>
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Locale</div>
                                                <div className="">{profileDetails.language_code ? profileDetails.language_code.toUpperCase() : '--'}</div>
                                            </div>
                                        </div>

                                        <div className="row mt-3">
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Postal City</div>
                                                <div className="">{profileDetails.postal_city || '--'}</div>
                                            </div>
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Postal Code</div>
                                                <div className="">{profileDetails.lgpostcode || '--'}</div>
                                            </div>
                                        </div>


                                        <div className="row mt-3">
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Address</div>
                                                <div className="">{profileDetails.adr_long_lbl || '--'}</div>
                                            </div>
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Status</div>
                                                <div className="text-capitalize">
                                                    <i className={`fa fa-xs fa-circle ${(profileDetails.ind_status_desc || '').toLowerCase() === 'valid' ? 'text-success' : 'text-danger'} pr-2 hcp-status-icon`}></i>
                                                    {profileDetails.ind_status_desc || '--'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </Modal.Body>
                        </Modal>
                    </div>
                </div>
                <HCPFilter
                    ref={hcpFilterRef}
                    show={showFilterSidebar}
                    selectedFilterSetting={selectedFilterSetting}
                    onHide={() => setShowFilterSidebar(false)}
                    // onExecute={handleFilterExecute}
                    tableName="crdlp-hcp-profiles"
                />
            </div>
        </main>
    );
}
