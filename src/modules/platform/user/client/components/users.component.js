import { NavLink, useLocation, useHistory } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useToasts } from 'react-toast-notifications';
import { getUsers } from '../user.actions';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Faq from '../../../faq/client/faq.component';
import UsersFilter from './users-filter.component';

const safeGet = (object, property) => {
    const propData = (object || {})[property];
    return (prop) => prop ? safeGet(propData, prop) : propData;
};

const flatten = (array) => {
    return Array.isArray(array) ? [].concat(...array.map(flatten)) : array;
}

const union = (a, b) => [...new Set([...a, ...b])];

export default function Users() {
    const dispatch = useDispatch();
    const location = useLocation();
    const history = useHistory();

    const [codBase, setCodBase] = useState(null);
    const [userCountries, setUserCountries] = useState([]);
    const [sort, setSort] = useState({ type: 'asc', value: null });

    const [showFilter, setShowFilter] = useState(false);
    const [isFilterEnabled, setIsFilterEnabled] = useState(false);
    const [selectedFilterSetting, setSelectedFilterSetting] = useState(null);

    const [showFaq, setShowFaq] = useState(false);
    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);

    const userdata = useSelector(state => state.userReducer.users);
    const countries = useSelector(state => state.countryReducer.countries);
    const params = new URLSearchParams(window.location.search);

    const { addToast } = useToasts();

    const filterRef = useRef();

    const extractUserCountries = (data) => {
        const profile_permission_sets = safeGet(data, 'userProfile')('up_ps')();
        const profile_countries = profile_permission_sets ? profile_permission_sets.map(pps => safeGet(pps, 'ps')('countries')()) : [];

        const userRoles = safeGet(data, 'userRoles')();
        const roles_countries = userRoles ? userRoles.map(role => {
            const role_permission_sets = safeGet(role, 'role')('role_ps')();
            return role_permission_sets.map(rps => safeGet(rps, 'ps')('countries')());
        }) : [];

        const user_countries = union(flatten(profile_countries), flatten(roles_countries)).filter(e => e);

        return user_countries;
    }

    const extractLoggedInUserCountries = (data) => {
        const profile_permission_sets = safeGet(data, 'profile')('permissionSets')();
        const profile_countries = profile_permission_sets ? profile_permission_sets.map(pps => safeGet(pps, 'countries')() || []) : [];

        const userRoles = safeGet(data, 'role')();
        const roles_countries = userRoles ? userRoles.map(role => {
            const role_permission_sets = safeGet(role, 'permissionSets')();
            return role_permission_sets.map(rps => safeGet(rps, 'countries')() || []);
        }) : [];

        const user_countries = union(flatten(profile_countries), flatten(roles_countries)).filter(e => e);

        return user_countries;
    }

    const sortCountries = (user_countries) => {
        let countryArr = [];
        let countryString = "";
        if (countries.length > 0 && (user_countries.length)) {
            user_countries.map((country_iso2) =>
                countryArr.push(countries.find(i => i.country_iso2 === country_iso2)).codbase_desc);
        }

        countryArr.sort((a, b) => (a.codbase_desc > b.codbase_desc) ? 1 : -1);
        countryArr.forEach((element, key) => {
            if (!element) return;
            countryString = countryString + element.codbase_desc;
            if (key < countryArr.length - 1) countryString = countryString + ', ';
        });

        return countryString;
    }

    useEffect(() => {
        async function getCountries() {
            const userProfile = (await axios.get('/api/users/profile')).data;
            const user_countries = extractLoggedInUserCountries(userProfile);
            setUserCountries(fetchUserCountries(user_countries, countries));
        }
        getCountries();
    }, []);

    useEffect(() => {
        setCodBase(params.get('codbase') ? params.get('codbase') : null);
        const searchObj = {};
        const searchParams = location.search.slice(1).split("&");

        searchParams.forEach(element => {
            searchObj[element.split("=")[0]] = element.split("=")[1];
        });

        const filterID = params.get('filter');

        if(filterID) axios.get(`/api/filter/${filterID}`)
            .then(res => {
                setSelectedFilterSetting(res.data);
                setIsFilterEnabled(true);
                const filterSetting = res.data.settings;
                dispatch(getUsers(searchObj.page, searchObj.codbase, searchObj.orderBy, searchObj.orderType, filterSetting));
            })
        else {
            const { filters, logic } = filterRef.current.multiFilterProps.values || {};
            const filterSetting = filters && filters.length
                ? {
                    filters: filters,
                    logic: logic
                }
                : null;
            dispatch(getUsers(searchObj.page, searchObj.codbase, searchObj.orderBy, searchObj.orderType, filterSetting));
        };

        setSort({ type: params.get('orderType') || 'asc', value: params.get('orderBy') });
    }, [location]);


    const fetchUserCountries = (args, allCountries) => {
        const countryList = [];
        args.forEach(element => {
            countryList.push(allCountries.find(x => x.country_iso2 == element));
        });
        return countryList.filter(c => c);
    }

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
        if (userdata.page > 1) urlChange(userdata.page - 1, userdata.codBase, params.get('orderBy'), true);
    };

    const pageRight = () => {
        if (userdata.end !== userdata.total) urlChange(userdata.page + 1, userdata.codBase, params.get('orderBy'), true);
    };

    const handleFilterExecute = async (multiFilterSetting) => {
        const filterID = multiFilterSetting.selectedSettingID;
        const shouldUpdateFilter = multiFilterSetting.saveType === 'save_existing';

        if(multiFilterSetting.shouldSaveFilter) {
            const settingName = multiFilterSetting.saveType === 'save_existing'
                ? multiFilterSetting.selectedFilterSettingName
                : multiFilterSetting.newFilterSettingName;

            const filterSetting = {
                title: settingName,
                table: "cdp-users",
                settings: {
                    filters: multiFilterSetting.filters,
                    logic: multiFilterSetting.logic
                }
            }

            if(filterID && shouldUpdateFilter) {
                try{
                    await axios.put(`/api/filter/${filterID}`, filterSetting);
                    history.push(`${location.pathname}?filter=${filterID}`);
                }catch(err){
                    const errorMessage = err.response.data && err.response.data || 'There was an error updating the filter setting.';
                    addToast(errorMessage, {
                        appearance: 'error',
                        autoDismiss: true
                    });
                    return Promise.reject();
                }
            }else {
                try{
                    const { data } = await axios.post('/api/filter', filterSetting);
                    history.push(`${location.pathname}?filter=${data.id}`);
                }catch(err){
                    const errorMessage = err.response.data && err.response.data || 'There was an error updating the filter setting.';
                    addToast(errorMessage, {
                        appearance: 'error',
                        autoDismiss: true
                    });
                    return Promise.reject();
                }
            }
        }
        else {
            history.push(location.pathname);
        };
        setIsFilterEnabled(true);
    }

    const resetFilter = async () => {
        setSelectedFilterSetting(null);
        setIsFilterEnabled(false);
        await filterRef.current.multiFilterProps.resetFilter();
        history.push(location.pathname);
    }

    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav className="breadcrumb justify-content-between align-items-center" aria-label="breadcrumb">
                            <ol className="rounded-0 m-0 p-0 d-none d-sm-flex">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/platform">Management of Customer Data platform</NavLink></li>
                                <li className="breadcrumb-item active"><span>CDP User List</span></li>
                            </ol>
                            <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                    <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                    <Dropdown.Item className="px-2" href="/platform"><i className="fas fa-link mr-2"></i> Management of Customer Data platform</Dropdown.Item>
                                    <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> CDP User List</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <span className="ml-auto mr-3"><i type="button" onClick={handleShowFaq} className="icon icon-help breadcrumb__faq-icon cdp-text-secondary"></i></span>
                        </nav>
                        <Modal show={showFaq} onHide={handleCloseFaq} size="lg" centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Questions You May Have</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="faq__in-modal"><Faq topic="manage-access" /></Modal.Body>
                        </Modal>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="d-sm-flex justify-content-between align-items-center mb-3 mt-4">
                            <h4 className="cdp-text-primary font-weight-bold mb-3 mb-sm-0">CDP User List</h4>
                            <div className="d-flex justify-content-between align-items-center">
                                {/* <Dropdown className="ml-auto dropdown-customize">
                                    <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center">
                                        <i className="icon icon-filter mr-2 mb-n1"></i> {userdata.codbase && (countries.find(i => i.codbase === userdata.codbase)) ? (countries.find(i => i.codbase === userdata.codbase)).codbase_desc : 'Filter by Country'}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {
                                            userdata.codbase && <Dropdown.Item onClick={() => urlChange(1, 'null', params.get('orderBy'))}>All</Dropdown.Item>
                                        }
                                        {
                                            userCountries.length > 0 && userCountries.map((country, index) => (
                                                country.codbase !== userdata.codbase && <Dropdown.Item key={index} onClick={() => urlChange(1, country.codbase, params.get('orderBy'))}>{country.codbase_desc}</Dropdown.Item>
                                            ))
                                        }
                                    </Dropdown.Menu>
                                </Dropdown> */}
                                <button
                                    className={`btn cdp-btn-outline-primary ${isFilterEnabled ? 'multifilter_enabled' : ''}`}
                                    onClick={() => setShowFilter(true)}
                                >
                                    <i className={`fas fa-filter  ${isFilterEnabled ? '' : 'mr-2'}`}></i>
                                    <i className={`fas fa-database ${isFilterEnabled ? 'd-inline-block filter__sub-icon mr-1' : 'd-none'}`}></i>
                                    Filter
                                </button>
                                {
                                    isFilterEnabled &&
                                    <button
                                        className={`btn cdp-btn-outline-secondary ml-2 ${isFilterEnabled ? 'multifilter_enabled' : ''}`}
                                        onClick={resetFilter}
                                    >
                                        <i className={`fas fa-filter  ${isFilterEnabled ? '' : 'mr-2'}`}></i>
                                        <i className={`fas fa-times ${isFilterEnabled ? 'd-inline-block filter__sub-icon mr-1' : 'd-none'}`}></i>
                                        Reset
                                    </button>
                                }
                                <NavLink to="/platform/create-user" className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus pr-1"></i> Create new user
                                </NavLink>
                            </div>
                        </div>

                        {userdata['users'] && userdata['users'].length > 0 &&
                            <React.Fragment>
                                <div className="table-responsive shadow-sm bg-white">
                                    <table className="table table-hover table-sm mb-0 cdp-table">
                                        <thead className="cdp-bg-primary text-white cdp-table__header">
                                            <tr>
                                                <th width="12%"><span className={sort.value === 'first_name' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(null, codBase, 'first_name')}>First Name<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                <th width="12%"><span className={sort.value === 'last_name' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(null, codBase, 'last_name')}>Last Name<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                <th width="20%"><span className={sort.value === 'email' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(null, codBase, 'email')}>Email<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                <th width="6%"><span className={sort.value === 'status' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(null, codBase, 'status')}>Status<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                <th width="10%"><span className="cdp-table__col-sorting">Countries</span></th>
                                                <th width="10%"><span className={sort.value === 'created_at' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(null, codBase, 'created_at')}>Creation Date<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                <th width="10%"><span className={sort.value === 'expiry_date' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(null, codBase, 'expiry_date')}>Expiry Date<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                <th width="10%"><span className={sort.value === 'created_by' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(null, codBase, 'created_by')}>Created By<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                <th width="10%">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="cdp-table__body bg-white">
                                            {userdata.users.map(row => (
                                                <tr key={row.id}>
                                                    <td className="text-break">{row.first_name}</td>
                                                    <td className="text-break">{row.last_name}</td>
                                                    <td className="text-break">{row.email}</td>
                                                    <td className="text-capitalize">{row.status}</td>
                                                    <td>{sortCountries(extractUserCountries(row))}</td>
                                                    <td>{(new Date(row.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')}</td>
                                                    <td>{(new Date(row.expiry_date)).toLocaleDateString('en-GB').replace(/\//g, '.')}</td>
                                                    <td>{row.createdBy}</td>
                                                    <td>
                                                        <NavLink to={`/platform/users/${row.id}`} className="btn cdp-btn-outline-primary btn-sm"><i class="icon icon-user mr-2"></i>Profile</NavLink>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {((userdata.page === 1 &&
                                        userdata.total > userdata.limit) ||
                                        (userdata.page > 1))
                                        && userdata['users'] &&
                                        <div className="pagination justify-content-end align-items-center border-top p-3">
                                            <span className="cdp-text-primary font-weight-bold">{userdata.start + ' - ' + userdata.end}</span> <span className="text-muted pl-1 pr-2"> {' of ' + userdata.total}</span>
                                            <span className="pagination-btn" onClick={() => pageLeft()} disabled={userdata.page <= 1}><i className="icon icon-arrow-down ml-2 prev"></i></span>
                                            <span className="pagination-btn" onClick={() => pageRight()} disabled={userdata.end === userdata.total}><i className="icon icon-arrow-down ml-2 next"></i></span>
                                        </div>
                                    }
                                </div>


                            </React.Fragment>
                        }

                        {userdata['users'] && userdata['users'].length === 0 &&
                            <div className="row justify-content-center mt-5 pt-5 mb-3">
                                <div className="col-12 col-sm-6 py-4 bg-white shadow-sm rounded text-center">
                                    <i class="icon icon-team icon-6x cdp-text-secondary"></i>
                                    <h3 className="font-weight-bold cdp-text-primary pt-4">No Users Found!</h3>
                                    <h4 className="cdp-text-primary pt-3 pb-5">Click on the button below to create new one</h4>
                                    <NavLink to="/platform/create-user" className="btn cdp-btn-secondary text-white px-5 py-2 font-weight-bold">
                                        <i className="icon icon-plus pr-1"></i> Create New User
                                    </NavLink>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
            <UsersFilter
                ref={filterRef}
                tableName='cdp-users'
                show={showFilter}
                selectedFilterSetting={selectedFilterSetting}
                onHide={() => setShowFilter(false)}
                onExecute={handleFilterExecute}
            />
        </main>
    );
}
