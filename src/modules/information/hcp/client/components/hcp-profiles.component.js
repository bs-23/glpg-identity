import React, { useEffect, useState, useRef } from "react";
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useToasts } from 'react-toast-notifications';
import { LinkContainer } from 'react-router-bootstrap';
import Accordion from 'react-bootstrap/Accordion';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import axios from 'axios';
import _ from 'lodash';
import parse from 'html-react-parser';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import Faq from '../../../../platform/faq/client/faq.component';
import StatusupdateModal from '../../../../core/client/components/statusUpdateModal.component';
import { getAllCountries } from '../../../../core/client/country/country.actions';
import { getHcpProfiles, getHCPSpecialities } from '../hcp.actions';
import { HcpInlineEditSchema } from '../hcp.schema';
import uuidAuthorities from '../uuid-authorities.json';
import EditableTable from '../../../../core/client/components/EditableTable/EditableTable';
import { HCPFilter } from "../../../../information";

const SaveConfirmation = ({ show, onHideHandler, tableProps }) => {
    const [comment, setComment] = useState("");
    const [touched, setTouched] = useState(false);

    const maxCommentLength = 500;

    const { rowIndex, formikProps } = tableProps;
    const { values, submitForm } = formikProps || {};

    const handleSubmit = () => {
        values.rows[rowIndex].comment = comment;
        submitForm();
    }

    const handleOnBlur = () => {
        setTouched(true);
    }

    useEffect(() => {
        setComment('');
        setTouched(false);
    }, [show]);

    return <Modal
        show={show}
        onHide={onHideHandler}
        dialogClassName="modal-customize"
        aria-labelledby="example-custom-modal-styling-title"
        centered
    >
        <Modal.Header closeButton>
            <Modal.Title id="example-custom-modal-styling-title">
                Change Confirmation
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="p-3">
                <p className="">Please comment and continue to save the changes to the HCP profile</p>
                <div>
                    <div>
                        <label className="font-weight-bold">Comment <span className="text-danger">*</span></label>
                    </div>
                    <div>
                        <textarea className="form-control" rows="4" cols="45" value={comment} onBlur={handleOnBlur} onChange={(e) => setComment(e.target.value)} />
                    </div>
                    {(!comment || !comment.trim()) && touched && <div className="invalid-feedback">
                        Must provide a comment.
                    </div>}
                    {comment.trim().length > maxCommentLength && <div class="invalid-feedback">This field must be at most {maxCommentLength} characters long.</div>}
                    <button className="btn btn-block mt-3 cdp-btn-primary text-white" disabled={!comment || !comment.trim() || comment.trim().length > maxCommentLength} onClick={handleSubmit}> Save Changes </button>
                </div>
            </div>
        </Modal.Body>
    </Modal>
}

export default function hcpUsers() {
    const dispatch = useDispatch();
    const location = useLocation();
    const history = useHistory();
    const params = new URLSearchParams(window.location.search);

    const [showFaq, setShowFaq] = useState(false);
    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);

    const [show, setShow] = useState({ profileManage: false, updateStatus: false, saveConfirmation: false, filterSidebar: false });
    const [currentUser, setCurrentUser] = useState({});
    const { addToast } = useToasts();
    const [sort, setSort] = useState({ type: 'ASC', value: null });
    const [tableDirty, setTableDirty] = useState(false);
    const [editableTableProps, setEditableTableProps] = useState({});
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedFilterSetting, setSelectedFilterSetting] = useState(null);
    const [isFilterEnabled, setIsFilterEnabled] = useState(false);

    const hcps = useSelector(state => state.hcpReducer.hcps);
    const specialties = useSelector(state => state.hcpReducer.specialties);
    const allCountries = useSelector(state => state.countryReducer.allCountries);

    const hcpFilterRef = useRef();

    const pageLeft = () => {
        if (hcps.page > 1) urlChange(hcps.page - 1, hcps.codbase, params.get('status'), params.get('orderBy'), true);
    };

    const pageRight = () => {
        if (hcps.end !== hcps.total) urlChange(hcps.page + 1, hcps.codbase, params.get('status'), params.get('orderBy'), true);
    };

    const onUpdateStatus = (user) => {
        setCurrentUser(user);
        setShow({ ...show, updateStatus: true });
    }

    const handleFilterExecute = async (multiFilterSetting) => {
        const filterID = multiFilterSetting.selectedSettingID;
        const shouldUpdateFilter = multiFilterSetting.saveType === 'save_existing';

        if (multiFilterSetting.shouldSaveFilter) {
            const settingName = multiFilterSetting.saveType === 'save_existing'
                ? multiFilterSetting.selectedFilterSettingName
                : multiFilterSetting.newFilterSettingName;

            const filterSetting = {
                title: settingName,
                table: "hcp-profiles",
                settings: {
                    filters: multiFilterSetting.filters,
                    logic: multiFilterSetting.logic
                }
            }

            if (filterID && shouldUpdateFilter) {
                try {
                    await axios.put(`/api/filter/${filterID}`, filterSetting);
                    history.push(`/information/list/cdp?filter=${filterID}`);
                } catch (err) {
                    const errorMessage = err.response.data ? err.response.data : 'There was an error updating the filter setting.';
                    addToast(errorMessage, {
                        appearance: 'error',
                        autoDismiss: true
                    });
                    return Promise.reject();
                }
            } else {
                try {
                    const { data } = await axios.post('/api/filter', filterSetting);
                    history.push(`/information/list/cdp?filter=${data.id}`);
                } catch (err) {
                    const errorMessage = err.response.data ? err.response.data : 'There was an error updating the filter setting.';
                    addToast(errorMessage, {
                        appearance: 'error',
                        autoDismiss: true
                    });
                    return Promise.reject();
                }
            }
        }
        else {
            history.push(`/information/list/cdp`);
        }
        setIsFilterEnabled(true);
    }

    const loadHcpProfiles = (filterSetting) => {
        const requestBody = filterSetting && filterSetting.filters.length
            ? {
                filters: filterSetting.filters,
                logic: filterSetting.logic
            }
            : null;

        dispatch(getHcpProfiles(getQueryString(), requestBody));
        setSort({ type: params.get('orderType'), value: params.get('orderBy') });
    };

    const getConsentsForCurrentUser = async () => {
        const { data } = await axios.get(`/api/hcp-profiles/${currentUser.id}/consents`);
        setCurrentUser({ ...currentUser, consents: data.data });
    }

    const onManageProfile = (user) => {
        setShow({ ...show, profileManage: true });
        setCurrentUser(user);
    }

    const onTableRowSave = (user, tableProps) => {
        setShow({ ...show, saveConfirmation: true });
        setCurrentUser(user);
        setEditableTableProps({ ...editableTableProps, ...tableProps });
    }

    const getCountryName = (country_iso2) => {
        if (!allCountries || !country_iso2) return null;
        const country = allCountries.find(c => c.country_iso2.toLowerCase() === country_iso2.toLowerCase());
        return country && country.countryname;
    }

    const renderUuidAuthorities = () => {
        const authorityDropdown = (authorities) => {
            return (<Dropdown>
                <Dropdown.Toggle variant="" id="dropdown-basic" className="cdp-btn-outline-primary px-sm-3 px-2">
                    UUID Authorities
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu__no-hover py-0">
                    {
                        authorities.map(authority =>
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
            </Dropdown>);
        };

        const { filters } = isFilterEnabled ? hcpFilterRef.current.multiFilterProps.values || {} : {};

        const countryFilter = (filters || []).find(f => f.fieldName === 'country');

        if (countryFilter) {
            const authorityByCountry = uuidAuthorities.filter(a => countryFilter.value.some(v => a.codbase.toLowerCase() === v.toLowerCase()));

            if (countryFilter.value.length > 1) {
                return authorityDropdown(authorityByCountry);
            }

            return authorityByCountry.map(authority =>
            (
                <a key={authority.link} className="mr-3" role="button" onClick={() => openAuthorityLink(authority.link)}>
                    <img src={authority.logo} title={authority.name + " Logo"} alt={authority.name} height={authority.heightSingle} />
                </a>
            )
            );
        }

        return authorityDropdown(uuidAuthorities);
    };

    const urlChange = (pageNo, codBase, status, orderColumn, pageChange = false) => {
        if (Array.isArray(status)) status = 'self_verified,manually_verified';
        let orderType = params.get('orderType');
        const orderBy = params.get('orderBy');
        const filterID = params.get('filter');
        const page = pageNo ? pageNo : (params.get('page') ? params.get('page') : 1);
        const codbase = (codBase) ? codBase : params.get('codbase');
        if (!pageChange) {
            (orderBy === orderColumn) ? (orderType === 'asc' ? orderType = 'desc' : orderType = 'asc') : orderType = 'asc';
        }
        const url = `?page=${page}` + (codbase && codbase !== 'null' ? `&codbase=${codbase}` : ``) + (status && status !== 'null' ? `&status=${status}` : '') + (orderType !== 'null' && orderColumn !== 'null' && orderColumn !== null ? `&orderType=${orderType}&orderBy=${orderColumn}` : ``);
        history.push(location.pathname + url.concat(filterID ? `&filter=${filterID}` : ''));
    };

    const openAuthorityLink = (link) => {
        if (!link) return;
        window.open(link, 'name', 'width=600,height=400');
    }

    const openDiscoverHcpsWindow = (hcp) => {
        const width = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) * 0.8;
        const height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) * 0.9;
        window.open(`/information/discover-professionals?id=${hcp.id}`, 'name', `width=${width || 600},height=${height || 400}`);
        setSelectedRow(hcp.id);
    }

    const getSpecialtyOptions = async (value, row) => {
        const { country_iso2, locale } = row;
        const response = await dispatch(getHCPSpecialities(country_iso2, locale));
        const { value: { data: specialty_by_country_locale } } = response;

        if (!specialty_by_country_locale) return [];

        const options = specialty_by_country_locale.map(sp => ({
            key: `${sp.cod_id_onekey}_${sp.cod_description}`,
            value: sp.cod_id_onekey,
            label: sp.cod_description
        }));

        return options;
    }

    const getSpecialtyDescription = (specialty_onekey, row) => {
        const { locale, country_iso2 } = row;
        const country_locale_key = `${country_iso2.toLowerCase()}_${locale.toLowerCase()}`;
        const specialty_by_country_locale = specialties[country_locale_key];

        if (specialty_by_country_locale) {
            const specialties_by_onekey = specialty_by_country_locale.filter(sp => sp.cod_id_onekey === specialty_onekey);

            const speciality_en = specialties_by_onekey.find(sp => sp.cod_locale.toLowerCase() === 'en');
            if (speciality_en) return speciality_en.cod_description;

            const speciality_locale = specialties_by_onekey.find(sp => sp.cod_locale.toLowerCase() === locale.toLowerCase());
            return speciality_locale ? speciality_locale.cod_description : '';
        }

        return row.specialty_description;
    }

    const handleSpecialtyChange = async (updatedValue, oldValue, row, formikProps, { rowIndex }) => {
        const sp_desc = getSpecialtyDescription(updatedValue, row);
        formikProps.values.rows[rowIndex].specialty_description = sp_desc;
    }

    const formatDate = (date) => {
        return (new Date(date)).toLocaleDateString('en-GB').replace(/\//g, '.')
    }

    const submitHandler = ({ getUpdatedCells }, done) => {
        const updatedCells = getUpdatedCells(["id", "comment"]);
        axios.put('/api/hcp-profiles/update-hcps', updatedCells)
            .then(({ data }) => {
                addToast('Successfully saved changes.', {
                    appearance: 'success',
                    autoDismiss: true
                });
                done(data.data);
                setShow({ ...show, saveConfirmation: false });
            })
            .catch(err => {
                addToast('Could not save changes. Please correct the following errors.', {
                    appearance: 'error',
                    autoDismiss: true
                });
                done(null, err.response.data.errors);
            });
    }

    const generateSortHandler = columnName => {
        console.log(hcps.codBase, params.get('status'), columnName);
        urlChange(1, hcps.codBase, params.get('status'), columnName)
    }

    const renderStatus = ({ value: status, row }) => {
        return status === 'self_verified'
            ? <span><i className="fa fa-xs fa-circle text-success pr-2 hcp-status-icon"></i>Self Verified</span>
            : status === 'manually_verified'
                ? <span><i className="fa fa-xs fa-circle text-success pr-2 hcp-status-icon"></i>Manually Verified</span>
                : status === 'consent_pending'
                    ? <span><i className="fa fa-xs fa-circle text-warning pr-2 hcp-status-icon"></i>Consent Pending</span>
                    : status === 'not_verified'
                        ? <span class="text-nowrap"><i className="fa fa-xs fa-circle text-danger pr-2 hcp-status-icon"></i>Not Verified <i className="fas fa-search search-in-okla ml-1 cdp-text-primary cursor-pointer" onClick={() => openDiscoverHcpsWindow(row)}></i></span>
                        : status === 'rejected'
                            ? <span><i className="fa fa-xs fa-circle text-danger pr-2 hcp-status-icon"></i>Rejected</span>
                            : <span></span>
    }

    const renderActions = ({ row, rowIndex, formikProps, hasRowChanged, editableTableProps: editProps }) => {
        const { dirty, resetForm, initialValues, isValid } = formikProps;

        return <div className="position-relative" title={tableDirty ? "Save or reset changes to perform actions" : null}>
            {!hasRowChanged && <Dropdown className={`dropdown-customize ${dirty ? 'hcp-inline-disable' : ''}`}>
                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1">
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <LinkContainer to="#"><Dropdown.Item onClick={() => onManageProfile(initialValues.rows[rowIndex])}>Profile</Dropdown.Item></LinkContainer>
                    {row.status === 'not_verified' && <LinkContainer disabled={dirty} to="#"><Dropdown.Item onClick={() => onUpdateStatus(initialValues.rows[rowIndex])}>Manage Status</Dropdown.Item></LinkContainer>}
                </Dropdown.Menu>
            </Dropdown>}
            {hasRowChanged &&
                <>
                    <div className="d-flex position-absolute inline-editing__btn-wrap">
                        <i style={isValid ? {} : { pointerEvents: 'none' }} onClick={() => onTableRowSave(hcps.users[rowIndex], { rowIndex, editableTableProps: editProps, formikProps })} disabled={!dirty} className={isValid ? 'fas fa-check mr-3 cdp-text-primary fa-1_5x' : 'fas fa-check mr-3 cdp-text-primary fa-1_5x inline-editing__btn-disable'} title="Save Changes" type="button"></i>
                        <i onClick={resetForm} className="fas fa-times text-danger fa-1_5x cursor-pointer" title="Cancel Changes"></i>
                    </div>
                </>
            }
        </div>
    }

    const RegistrationHeader = () => {
        return <span className={sort.value === 'created_at' ? `cdp-table__col-sorting sorted ${sort.type && sort.type.toLowerCase()}` : 'cdp-table__col-sorting'} >
            Date of <br /> Registration
            {!tableDirty && <i onClick={() => generateSortHandler('created_at')} className="icon icon-sort cdp-table__icon-sorting"></i>}
        </span>
    }

    const columns = [
        {
            id: 'created_at',
            name: 'Date of Registration',
            editable: false,
            onSort: () => generateSortHandler('created_at'),
            customizeCellContent: formatDate,
            fieldType: { name: 'date' },
            CustomHeader: RegistrationHeader,
            width: "8%"
        },
        {
            id: 'email',
            name: 'Email',
            unique: true,
            onSort: () => generateSortHandler('email'),
            fieldType: { name: 'email', maxLength: '100' },
            width: "12%",
            editable: (row) => ['manually_verified', 'self_verified'].includes(row.status)
        },
        {
            id: 'first_name',
            name: 'First Name',
            fieldType: { name: 'text', maxLength: '50' },
            onSort: () => generateSortHandler('first_name'),
            class: "text-break",
            width: "10%",
            editable: (row) => ['manually_verified', 'self_verified'].includes(row.status)
        },
        {
            id: 'last_name',
            name: 'Last Name',
            editable: false,
            fieldType: { name: 'text', maxLength: '50' },
            onSort: () => generateSortHandler('last_name'),
            class: "text-break",
            width: "10%"
        },
        {
            id: 'status',
            name: 'Status',
            editable: false,
            customCell: renderStatus,
            onSort: () => generateSortHandler('status'),
            width: "8%"
        },
        {
            id: 'uuid',
            name: 'UUID',
            unique: true,
            onSort: () => generateSortHandler('uuid'),
            fieldType: { name: 'email', maxLength: '20' },
            width: "9%",
            editable: (row) => row.status === 'manually_verified'
        },
        {
            id: 'country_iso2',
            name: 'Country',
            editable: false,
            width: "12%",
            customizeCellContent: getCountryName
        },
        {
            id: 'specialty_onekey',
            name: 'Specialty',
            width: "10%",
            onChangeAction: handleSpecialtyChange,
            customizeCellContent: (value, row) => row.specialty_description,
            fieldType: { name: 'select', options: getSpecialtyOptions },
            editable: (row) => row.status === 'manually_verified'
        },
        {
            id: 'telephone',
            name: 'Phone',
            editable: (row) => ['manually_verified', 'self_verified'].includes(row.status),
            width: "8%",
            fieldType: { name: 'text', maxLength: '25' },
        },
        {
            id: 'individual_id_onekey',
            name: 'OneKeyID',
            editable: (row) => ['manually_verified'].includes(row.status),
            width: "8%",
            unique: true
        },
        {
            id: 'action',
            name: 'Action',
            editable: false,
            customCell: renderActions,
            class: "posi-relative",
            width: "8%"
        }
    ];

    const resetFilter = async () => {
        setSelectedFilterSetting(null);
        setIsFilterEnabled(false);
        await hcpFilterRef.current.multiFilterProps.resetFilter();
        history.push(location.pathname);
    }

    const getQueryString = () => {
        const params1 = new URLSearchParams(location.search);
        params1.delete('status');
        const queryString = params1.toString();
        return '?' + queryString;
    }

    const handleTableDirtyStatusChange = (dirty) => {
        setTableDirty(dirty);
        window.tableDirty = dirty;
    }

    const alertUserBeforeClosingWindow = (e) => {
        if (window.tableDirty) {
            e.preventDefault();
            e.returnValue = '';
        }
    }

    useEffect(() => {
        dispatch(getAllCountries());
        window.addEventListener('beforeunload', alertUserBeforeClosingWindow);
        window.tableDirty = false;
        return () => {
            window.removeEventListener('beforeunload', alertUserBeforeClosingWindow);
            delete window.tableDirty;
        }
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const filterID = urlParams.get('filter');

        if (filterID) axios.get(`/api/filter/${filterID}`)
            .then(res => {
                setSelectedFilterSetting(res.data);
                setIsFilterEnabled(true);
                loadHcpProfiles(res.data.settings);
            })
        else {
            let filterSetting;

            if (location.state && location.state.filterSetting) {
                filterSetting = location.state.filterSetting;

                setIsFilterEnabled(true);
                setSelectedFilterSetting({ settings: filterSetting });
            }
            else {
                const { filters, logic } = hcpFilterRef.current.multiFilterProps.values || {};

                filterSetting = filters && filters.length
                    ? {
                        filters,
                        logic
                    }
                    : null;
            }

            loadHcpProfiles(filterSetting);
        }
    }, [location]);

    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav className="breadcrumb justify-content-between align-items-center" aria-label="breadcrumb">
                            <ol className="rounded-0 m-0 p-0 d-none d-sm-flex">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/information">Information Management</NavLink></li>
                                <li className="breadcrumb-item active"><span>HCP Profile List</span></li>
                            </ol>
                            <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                    <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                    <Dropdown.Item className="px-2" href="/information"><i className="fas fa-link mr-2"></i> Information Management</Dropdown.Item>
                                    <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> HCP Profile List</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <span className="ml-auto mr-3"><i onClick={handleShowFaq} className="icon icon-help breadcrumb__faq-icon cdp-text-secondary cursor-pointer"></i></span>
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
                        <h4 className="cdp-text-primary font-weight-bold my-3">List of HCP User</h4>
                        <div>
                            <div className="d-sm-flex justify-content-between align-items-end mt-1 cdp-table__responsive-sticky-panel">
                                <div>
                                    <div className="custom-tab px-3 py-3 cdp-border-primary active">Customer Data Platform</div>
                                    <NavLink className="custom-tab px-3 py-3 cdp-border-primary" to="/information/list/crdlp">CRDLP</NavLink>
                                </div>
                                <div className="d-flex pt-3 pt-sm-0 mb-2">
                                    {hcps['users'] && hcps['users'].length > 0 &&
                                        <Accordion className="cdp-table__responsive-accordion d-block d-sm-none">
                                            <Accordion.Toggle eventKey="0" className="btn btn-sm px-3 mr-2 cdp-btn-outline-primary rounded shadow-0 mb-0 p-2"><i className="fas fa-sort cdp-text-primary"></i></Accordion.Toggle>
                                            <Accordion.Collapse eventKey="0" className="cdp-table__responsive-accordion-body">
                                                <div className="cdp-bg-primary p-2 text-white">
                                                <span className={sort.value === 'created_at' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => generateSortHandler('created_at')}>Date of Registration<i className="icon icon-sort cdp-table__icon-sorting"></i></span>
                                                <span className={sort.value === 'email' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => generateSortHandler('email')}>Email<i className="icon icon-sort cdp-table__icon-sorting"></i></span>
                                                <span className={sort.value === 'first_name' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => generateSortHandler('first_name')}>First Name<i className="icon icon-sort cdp-table__icon-sorting"></i></span>
                                                <span className={sort.value === 'last_name' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() =>generateSortHandler('last_name')}>Last Name<i className="icon icon-sort cdp-table__icon-sorting"></i></span>
                                                <span className={sort.value === 'status' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => generateSortHandler('status')}>Status<i className="icon icon-sort cdp-table__icon-sorting"></i></span>
                                                <span className={sort.value === 'uuid' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => generateSortHandler('uuid')}>UUID<i className="icon icon-sort cdp-table__icon-sorting"></i></span>
                                            </div>
                                            </Accordion.Collapse>
                                        </Accordion>
                                    }
                                    <div className="mr-2">
                                        <div>
                                            {renderUuidAuthorities()}
                                        </div>
                                    </div>
                                    <div title={tableDirty ? "Save or reset changes to open filter" : null}>
                                        <button
                                            className={`btn ${isFilterEnabled ? 'multifilter_enabled cdp-btn-primary text-white' : 'cdp-btn-outline-primary'} ${tableDirty ? 'hcp-inline-disable' : null}`}
                                            onClick={() => setShow({ ...show, filterSidebar: true })}
                                        >
                                            <i className={`fas fa-filter  ${isFilterEnabled ? '' : ''}`}></i>
                                            <i className={`fas fa-database ${isFilterEnabled ? 'd-inline-block filter__sub-icon ' : 'd-none'}`}></i>
                                            <span className="d-none d-sm-inline-block ml-2"> Filter</span>
                                        </button>
                                    </div>
                                    {
                                        isFilterEnabled &&
                                        <div title={tableDirty ? "Save or reset changes to open filter" : null}>
                                            <button
                                                className={`btn cdp-btn-outline-secondary ml-2 ${isFilterEnabled ? 'multifilter_enabled' : ''} ${tableDirty ? 'hcp-inline-disable' : null}`}
                                                onClick={resetFilter}
                                            >
                                                <i className={`fas fa-filter  ${isFilterEnabled ? '' : 'mr-2'}`}></i>
                                                <i className={`fas fa-times ${isFilterEnabled ? 'd-inline-block filter__sub-icon mr-1' : 'd-none'}`}></i>
                                                Reset
                                            </button>
                                        </div>
                                    }
                                </div>
                            </div>

                            <Modal
                                size="lg"
                                show={show.profileManage}
                                onShow={getConsentsForCurrentUser}
                                onHide={() => { setShow({ ...show, profileManage: false }) }}
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
                                    <div className="p-3">
                                        <div className="row">
                                            <div className="col">
                                                <h4 className="mt-1 font-weight-bold">{`${currentUser.first_name || ''} ${currentUser.last_name || ''}`}</h4>
                                                <div className="">{currentUser.specialty_description}</div>
                                            </div>
                                        </div>
                                        <div className="row mt-3">

                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Email</div>
                                                <div className="">{currentUser.email || '--'}</div>
                                            </div>
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">UUID</div>
                                                <div className="">{currentUser.uuid || '--'}</div>
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Phone Number</div>
                                                <div className="">{currentUser.telephone || '--'}</div>
                                            </div>
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">OneKeyID</div>
                                                <div className="">{currentUser.individual_id_onekey || '--'}</div>
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Date of Birth</div>
                                                <div className="">{currentUser.birthdate ? currentUser.birthdate : '--'}</div>
                                            </div>
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Status</div>
                                                <div className="text-capitalize">{currentUser.status ? _.startCase(_.toLower(currentUser.status.replace(/_/g, ' '))) : '--'}</div>
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Country</div>
                                                <div className="">{getCountryName(currentUser.country_iso2) || '--'}</div>
                                            </div>
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Date of Registration</div>
                                                <div className="">{currentUser.created_at ? (new Date(currentUser.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.') : '--'}</div>
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Locale</div>
                                                <div>{currentUser.locale ? currentUser.locale : '--'}</div>
                                            </div>
                                        </div>
                                        <div className="row mt-4">
                                            <div className="col accordion-consent rounded shadow-sm p-0">
                                                <h4 className="accordion-consent__header p-3 font-weight-bold mb-0 cdp-light-bg">Consents</h4>
                                                {currentUser.consents && currentUser.consents.length ? <Accordion>{currentUser.consents.map(consent =>
                                                    <Card key={consent.id}>
                                                        <Accordion.Collapse eventKey={consent.id}>
                                                            <Card.Body>
                                                                <div>{parse(consent.rich_text)}</div>
                                                                <div className="pt-2"><span className="pr-1 text-dark"><i className="icon icon-check-square mr-1 small"></i>Opt-Type:</span> <span className="text-capitalize">{consent.opt_type}</span></div>
                                                                <div><span className="pr-1 text-dark"><i className="icon icon-calendar-check mr-1 small"></i>Updated on:</span>{(new Date(consent.consent_given_time)).toLocaleDateString('en-GB').replace(/\//g, '.')}</div>
                                                            </Card.Body>
                                                        </Accordion.Collapse>
                                                        <Accordion.Toggle as={Card.Header} eventKey={consent.id} className="p-3 d-flex align-items-baseline justify-content-between border-0" role="button">
                                                            <span className="d-flex align-items-center"><i className={`icon ${consent.consent_given ? 'icon-check-filled' : 'icon-close-circle text-danger'} cdp-text-primary mr-4 consent-check`}></i> <span className="consent-summary">{consent.preference}</span></span>
                                                            <i className="icon icon-arrow-down ml-2 accordion-consent__icon-down"></i>
                                                        </Accordion.Toggle>
                                                    </Card>
                                                )}</Accordion> : <div className="m-3 alert alert-warning">The HCP has not given any consent.</div>}
                                            </div>
                                        </div>
                                    </div>
                                </Modal.Body>
                            </Modal>

                            <StatusupdateModal
                                user={currentUser}
                                show={show.updateStatus}
                                type={'list'}
                                onStatusUpdate={() => {
                                    dispatch(getHcpProfiles(getQueryString(), isFilterEnabled
                                        ? (
                                            {
                                                filters: hcpFilterRef.current.multiFilterProps.values.filters,
                                                logic: hcpFilterRef.current.multiFilterProps.values.logic
                                            }
                                        )
                                        : null
                                    ));
                                }}
                                onHide={() => {
                                    setShow({ ...show, updateStatus: false });
                                }}
                            />

                            <SaveConfirmation
                                show={show.saveConfirmation}
                                onHideHandler={() => { setShow({ ...show, saveConfirmation: false }) }}
                                tableProps={editableTableProps}
                            />

                            {hcps['users'] && hcps['users'].length > 0 &&
                                <React.Fragment>
                                    <EditableTable
                                        rows={hcps.users}
                                        columns={columns}
                                        sortOn={sort.value}
                                        sortType={sort.type}
                                        onSubmit={submitHandler}
                                        schema={HcpInlineEditSchema}
                                        singleRowEditing={true}
                                        selectedRow={selectedRow}
                                        onDirtyChange={handleTableDirtyStatusChange}
                                        enableReinitialize
                                    />
                                    {((hcps.page === 1 &&
                                        hcps.total > hcps.limit) ||
                                        (hcps.page > 1))
                                        && hcps['users'] &&
                                        <div className="pagination justify-content-end align-items-center border-top p-3" title={tableDirty ? "Save or reset changes to navigate between pages" : null}>
                                            <span className="cdp-text-primary font-weight-bold">{hcps.start + ' - ' + hcps.end}</span> <span className="text-muted pl-1 pr-2"> {' of ' + hcps.total}</span>
                                            <span style={tableDirty ? { pointerEvents: 'none' } : {}} className="pagination-btn" data-testid='Prev' onClick={() => pageLeft()} disabled={hcps.page <= 1 || tableDirty}><i className="icon icon-arrow-down ml-2 prev"></i></span>
                                            <span style={tableDirty ? { pointerEvents: 'none' } : {}} className="pagination-btn" data-testid='Next' onClick={() => pageRight()} disabled={hcps.end === hcps.total || tableDirty}><i className="icon icon-arrow-down ml-2 next"></i></span>
                                        </div>
                                    }
                                </React.Fragment>
                            }

                            {hcps['users'] && hcps['users'].length === 0 &&
                                <>
                                    <div className="row justify-content-center mt-sm-5 pt-5 mb-3">
                                        <div className="col-12 col-sm-6 py-4 bg-white shadow-sm rounded text-center">
                                            <i className="icon icon-team icon-6x cdp-text-secondary"></i>
                                            <h3 className="font-weight-bold cdp-text-primary pt-4">No Profile Found!</h3>
                                        </div>
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                </div>
                <HCPFilter
                    ref={hcpFilterRef}
                    show={show.filterSidebar}
                    selectedFilterSetting={selectedFilterSetting}
                    onHide={() => setShow({ ...show, filterSidebar: false })}
                    onExecute={handleFilterExecute}
                    tableName="hcp-profiles"
                />
            </div>
        </main >
    );
}
