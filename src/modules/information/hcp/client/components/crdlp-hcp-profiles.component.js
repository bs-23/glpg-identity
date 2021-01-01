import { NavLink, useLocation, useHistory } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCrdlpHcpProfiles } from '../hcp.actions';
import Modal from 'react-bootstrap/Modal';
import Faq from '../../../../platform/faq/client/faq.component';

const safeGet = (object, property) => {
    const propData = (object || {})[property];
    return (prop) => prop ? safeGet(propData, prop) : propData;
};

const flatten = (array) => {
    return Array.isArray(array) ? [].concat(...array.map(flatten)) : array;
}

const union = (a, b) => [...new Set([...a, ...b])];

export default function CrdlpHcpProfiles() {
    const dispatch = useDispatch();
    const location = useLocation();
    const history = useHistory();

    const [codBase, setCodBase] = useState(null);
    const [sort, setSort] = useState({ type: 'asc', value: null });

    const [showFaq, setShowFaq] = useState(false);
    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);

    const hcpUsers = useSelector(state => state.hcpReducer.crdlpHcps);
    const countries = useSelector(state => state.countryReducer.countries);
    const allCountries = useSelector(state => state.countryReducer.allCountries);
    const params = new URLSearchParams(window.location.search);

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
                        <div className="d-sm-flex justify-content-between align-items-center mb-3 mt-4">
                            <div className="d-flex align-items-center justify-content-between">
                                <h4 className="cdp-text-primary font-weight-bold mb-0 mr-sm-4 mr-1">List of HCP User</h4>
                                {/* <div className="">
                                    <div>
                                        {userdata.codbase ?
                                            getUuidAuthorities(userdata.codbase).map(authority =>
                                            (
                                                <a key={authority.link} className="mr-3" role="button" onClick={() => openAuthorityLink(authority.link)}>
                                                    <img src={authority.logo} title={authority.name + " Logo"} alt={authority.name} height={authority.heightSingle} />
                                                </a>
                                            )
                                            )
                                            :
                                            <Dropdown>
                                                <Dropdown.Toggle variant="" id="dropdown-basic" className="cdp-btn-outline-primary px-sm-3 px-2">
                                                    UUID Authorities
                                                    </Dropdown.Toggle>
                                                <Dropdown.Menu className="dropdown-menu__no-hover py-0">
                                                    {
                                                        getUuidAuthorities().map(authority =>
                                                        (
                                                            <Dropdown.Item
                                                                key={authority.link} className="border-bottom py-2 px-3"
                                                                onClick={() => openAuthorityLink(authority.link)}
                                                                role="button"
                                                            >
                                                                <img src={authority.logo} title={authority.name + " Logo"} alt={authority.name} height={authority.height} />
                                                            </Dropdown.Item>
                                                        )
                                                        )
                                                    }
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        }
                                    </div>
                                </div> */}
                            </div>
                            <div className="d-flex pt-3 pt-sm-0">
                                {countries && hcpUsers['countries'] &&
                                    <React.Fragment>
                                        <Dropdown className="ml-auto dropdown-customize mr-2">
                                            <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle fixed-width btn d-flex align-items-center">
                                                <i className="icon icon-filter mr-2 mb-n1"></i> {hcpUsers.codbase && (countries.find(i => i.codbase === hcpUsers.codbase)) ? (countries.find(i => i.codbase === hcpUsers.codbase)).codbase_desc : 'Filter by Country'}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                {
                                                    hcpUsers.codbase && <Dropdown.Item onClick={() => urlChange(1, 'null', params.get('orderBy'))}>All</Dropdown.Item>
                                                }

                                                {
                                                    countries.map((item, index) => (
                                                        hcpUsers.countries.includes(item.country_iso2) &&
                                                        <Dropdown.Item key={index} className={hcpUsers.countries.includes(item.country_iso2) && hcpUsers.codbase === item.codbase ? 'd-none' : ''} onClick={() => urlChange(1, item.codbase, params.get('orderBy'), params.get('orderType'))}>
                                                            {
                                                                hcpUsers.countries.includes(item.country_iso2) ? item.codbase_desc : null
                                                            }
                                                        </Dropdown.Item>
                                                    ))

                                                }
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </React.Fragment>
                                }
                            </div>

                        </div>

                        <div>
                            <NavLink className="custom-tab px-3 py-3 cdp-border-primary" to="/information/list/cdp">CDP</NavLink>
                            <NavLink className="custom-tab px-3 py-3 cdp-border-primary" to="/information/list/crdlp">CRDLP</NavLink>
                        </div>

                        {hcpUsers['users'] && hcpUsers['users'].length > 0 &&
                            <React.Fragment>
                                <div className="table-responsive shadow-sm bg-white">
                                    <table className="table table-hover table-sm mb-0 cdp-table">
                                        <thead className="cdp-bg-primary text-white cdp-table__header">
                                            <tr>
                                                <th width="20%"><span className={sort.value === 'first_name' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(null, codBase, 'first_name')}>First Name<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>

                                                <th width="20%"><span className={sort.value === 'last_name' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(null, codBase, 'last_name')}>Last Name<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>

                                                <th width="15%"><span className="cdp-table__col-sorting">Onekey ID</span></th>

                                                <th width="15%"><span className="cdp-table__col-sorting">UUID</span></th>

                                                <th width="10%"><span className={sort.value === 'status' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(null, codBase, 'status')}>Status<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>

                                                <th width="10%"><span className="cdp-table__col-sorting">Country</span></th>

                                                <th width="10%"><span className={sort.value === 'last_name' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(null, codBase, 'last_name')}>Type<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>

                                                {/* <th width="10%">Action</th> */}
                                            </tr>
                                        </thead>
                                        <tbody className="cdp-table__body bg-white">
                                            {hcpUsers.users.map((row, idx) => (
                                                <tr key={'user-'+idx}>
                                                    <td className="text-break">{row.firstname}</td>
                                                    <td className="text-break">{row.lastname}</td>
                                                    <td className="text-break">{row.individual_id_onekey || '--'}</td>
                                                    <td className="text-break">{row.uuid_1 || '--'}</td>
                                                    <td>{row.ind_status_desc}</td>
                                                    <td>{getCountryName(row.country_iso2)}</td>
                                                    <td>{row.ind_type_desc}</td>

                                                    {/* <td>
                                                        <NavLink to={`/platform/users/${row.id}`} className="btn cdp-btn-outline-primary btn-sm"><i class="icon icon-user mr-2"></i>Profile</NavLink>
                                                    </td> */}
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
                    </div>
                </div>
            </div>
        </main>
    );
}
