import React, { useEffect, useState, useRef } from "react";
import { Form, Formik, Field, ErrorMessage } from 'formik';
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

import { getAllCountries } from '../../../../core/client/country/country.actions';
import { getHcpProfiles, getHCPSpecialities } from '../hcp.actions';
import { ApprovalRejectSchema, HcpInlineEditSchema } from '../hcp.schema';
import uuidAuthorities from '../uuid-authorities.json';
import EditableTable from '../../../../core/client/components/EditableTable/EditableTable';
import { HCPFilter }  from "../../../../information";

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
    const [tempFilterSetting, setTempFilterSetting] = useState(null);
    const [isFilterEnabled, setIsFilterEnabled] = useState(false);

    const hcps = useSelector(state => state.hcpReducer.hcps);
    const specialties = useSelector(state => state.hcpReducer.specialties);
    const countries = useSelector(state => state.countryReducer.countries);
    const allCountries = useSelector(state => state.countryReducer.allCountries);

    const hcpFilterRef = useRef();

    const pageLeft = () => {
        if (hcps.page > 1) urlChange(hcps.page - 1, hcps.codbase, hcps.status, params.get('orderBy'), true);
    };

    const pageRight = () => {
        if (hcps.end !== hcps.total) urlChange(hcps.page + 1, hcps.codbase, hcps.status, params.get('orderBy'), true);
    };

    const onUpdateStatus = (user) => {
        setCurrentUser(user);
        setShow({ ...show, updateStatus: true });
    }

    const onUpdateStatusSuccess = () => {
        addToast('Successfully changed user status.', {
            appearance: 'success',
            autoDismiss: true
        })
        loadHcpProfiles()
    }

    const onUpdateStatusFailure = (error) => {
        const errorMessage = error.response.data.errors.length ? error.response.data.errors[0].message : 'Could not change user status.'
        addToast(errorMessage, {
            appearance: 'error',
            autoDismiss: true
        });
    }

    const handleFilterExecute = async (multiFilterSetting) => {
        const filterID = multiFilterSetting.selectedSettingID;

        const filterSetting = {
            title: multiFilterSetting.filterSettingName,
            table: "hcp-profiles",
            settings: {
                filters: multiFilterSetting.filters,
                logic: multiFilterSetting.logic
            }
        }

        if(multiFilterSetting.shouldSaveFilter) {
            if(filterID) {
                try{
                    await axios.put(`/api/filter/${filterID}`, filterSetting);
                    history.push(`/information/list/cdp?filter=${filterID}`);
                }catch(err){
                    addToast('There was an error updating the filter setting.', {
                        appearance: 'success',
                        autoDismiss: true
                    });
                }
            }else {
                try{
                    const { data } = await axios.post('/api/filter', filterSetting);
                    history.push(`/information/list/cdp?filter=${data.id}`);
                }catch(err){
                    addToast('There was an error creating the filter setting.', {
                        appearance: 'success',
                        autoDismiss: true
                    });
                }
            }
        }
        else {
            const { settings } = filterSetting;
            if(multiFilterSetting.selectedSettingID) history.push(`/information/list?filter=${multiFilterSetting.selectedSettingID}`)
            else history.push(`/information/list`);
        };
        setIsFilterEnabled(true);
    }

    const loadHcpProfiles = (filterSetting) => {
        const searchObj = {};
        const searchParams = location.search.slice(1).split("&");
        searchParams.forEach(element => {
            searchObj[element.split("=")[0]] = element.split("=")[1];
        });

        const requestBody = filterSetting && filterSetting.filters.length
            ? {
                filters: filterSetting.filters,
                logic: filterSetting.logic
            }
            : null;

        setTempFilterSetting(requestBody);
        // dispatch(getHcpProfiles(searchObj.page, searchObj.status, searchObj.codbase, searchObj.orderBy, searchObj.orderType, requestBody));
        dispatch(getHcpProfiles(location.search, requestBody));
        setSort({ type: params.get('orderType'), value: params.get('orderBy') });
    };

    const getConsentsForCurrentUser = async () => {
        const { data } = await axios.get(`/api/hcp-profiles/${currentUser.id}/consents`);
        setCurrentUser({ ...currentUser, consents: data.data });
    }

    const isAllVerifiedStatus = () => {
        if (Array.isArray(hcps.status)) {
            const allVerifiedStatus = ["self_verified", "manually_verified"];
            let isSubset = true;
            allVerifiedStatus.forEach(status => { if (!hcps.status.includes(status)) isSubset = false });
            return isSubset && (hcps.status.length === 2);
        }
        return false;
    }

    const getSelectedStatus = () => {
        if (Array.isArray(hcps.status)) return isAllVerifiedStatus() ? 'All Verified' : hcps.status.map(status => _.startCase(_.toLower(status.replace('_', ' ')))).join(', ');
        return hcps.status ? _.startCase(_.toLower(hcps.status.replace('_', ' '))) : 'All';
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

    const getUuidAuthorities = (codbase) => {
        if (codbase) {
            const authorityByCountry = uuidAuthorities.filter(a => a.codbase.toLowerCase() === codbase.toLowerCase());
            return authorityByCountry;
        }

        return uuidAuthorities;
    };

    const urlChange = (pageNo, codBase, status, orderColumn, pageChange = false) => {
        if (Array.isArray(status)) status = 'self_verified,manually_verified';
        let orderType = params.get('orderType');
        const orderBy = params.get('orderBy');
        const page = pageNo ? pageNo : (params.get('page') ? params.get('page') : 1);
        const codbase = (codBase) ? codBase : params.get('codbase');
        if (!pageChange) {
            (orderBy === orderColumn) ? (orderType === 'asc' ? orderType = 'desc' : orderType = 'asc') : orderType = 'asc';
        }
        const url = `?page=${page}` + (codbase && codbase !== 'null' ? `&codbase=${codbase}` : ``) + (status && status !== 'null' ? `&status=${status}` : '') + (orderType !== 'null' && orderColumn !== 'null' && orderColumn !== null ? `&orderType=${orderType}&orderBy=${orderColumn}` : ``);
        history.push(location.pathname + url);
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

    const generateSortHandler = (columnName) => () => urlChange(1, hcps.codBase, hcps.status, columnName);

    const renderStatus = ({ value: status, row }) => {
        return status === 'self_verified'
            ? <span><i className="fa fa-xs fa-circle text-success pr-2 hcp-status-icon"></i>Self Verified</span>
            : status === 'manually_verified'
                ? <span><i className="fa fa-xs fa-circle text-success pr-2 hcp-status-icon"></i>Manually Verified</span>
                : status === 'consent_pending'
                    ? <span><i className="fa fa-xs fa-circle text-warning pr-2 hcp-status-icon"></i>Consent Pending</span>
                    : status === 'not_verified'
                        ? <span class="text-nowrap"><i className="fa fa-xs fa-circle text-danger pr-2 hcp-status-icon"></i>Not Verified <i type="button" className="fas fa-search search-in-okla ml-1 cdp-text-primary" onClick={() => openDiscoverHcpsWindow(row)}></i></span>
                        : status === 'rejected'
                            ? <span><i className="fa fa-xs fa-circle text-danger pr-2 hcp-status-icon"></i>Rejected</span>
                            : <span></span>
    }

    const renderOptInTypes = ({ value }) => {
        const allOptTypes = ['single-opt-in', 'double-opt-in', 'opt-out'];
        return <div className="text-center ml-n2">
            {value.includes('single-opt-in') ? <i title="Single Opt-In" className="fas fa-check cdp-text-primary mr-3"></i> : ''}
            {value.includes('double-opt-in') ? <i title="Double Opt-In" className="fas fa-check-double cdp-text-primary mr-3"></i> : ''}
            {value.includes('opt-out') ? <i title="Opt-out" className="far fa-window-close text-danger"></i> : ''}
            {value.filter(val => allOptTypes.some(ot => ot === val)).length ? '' : <div>N/A</div>}
        </div>
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
                        <i onClick={resetForm} className="fas fa-times text-danger fa-1_5x" title="Cancel Changes" type="button"></i>
                    </div>
                </>
            }
        </div>
    }

    const hintpopup = (
        <Popover id="popover-basic" className="shadow-lg">
            <Popover.Content className="px-3">
                <ul className="list-unstyled mb-0">
                    <li className="pl-0 pb-2"><i className="fas fa-check mr-1"></i> Single Opt-In</li>
                    <li className="pl-0 pb-2"><i className="fas fa-check-double mr-1"></i> Double Opt-In</li>
                    <li className="pl-0 pb-2"><i className="far fa-window-close text-danger mr-1"></i> Opt Out</li>
                </ul>
            </Popover.Content>
        </Popover>
    );

    const CustomOptInHeader = () => {
        return <div>Opt Type <OverlayTrigger trigger="click" rootClose placement="left" overlay={hintpopup}>
            <i className="fas fa-info-circle ml-1 text-white" role="button"></i>
        </OverlayTrigger></div>
    }

    const RegistrationHeader = () => {
        return <span className={sort.value === 'created_at' ? `cdp-table__col-sorting sorted ${sort.type && sort.type.toLowerCase()}` : 'cdp-table__col-sorting'} >
            Date of <br /> Registration
            {!tableDirty && <i onClick={generateSortHandler('created_at')} className="icon icon-sort cdp-table__icon-sorting"></i>}
        </span>
    }

    const columns = [
        {
            id: 'email',
            name: 'Email',
            unique: true,
            onSort: generateSortHandler('email'),
            fieldType: { name: 'email', maxLength: '100' },
            width: "12%",
            editable: (row) => ['manually_verified', 'self_verified'].includes(row.status)
        },
        {
            id: 'created_at',
            name: 'Date of Registration',
            editable: false,
            onSort: generateSortHandler('created_at'),
            customizeCellContent: formatDate,
            fieldType: { name: 'date' },
            CustomHeader: RegistrationHeader,
            width: "8%"
        },
        {
            id: 'first_name',
            name: 'First Name',
            fieldType: { name: 'text', maxLength: '50' },
            onSort: generateSortHandler('first_name'),
            class: "text-break",
            width: "10%",
            editable: (row) => ['manually_verified', 'self_verified'].includes(row.status)
        },
        {
            id: 'last_name',
            name: 'Last Name',
            editable: false,
            fieldType: { name: 'text', maxLength: '50' },
            onSort: generateSortHandler('last_name'),
            class: "text-break",
            width: "10%"
        },
        {
            id: 'status',
            name: 'Status',
            editable: false,
            customCell: renderStatus,
            onSort: generateSortHandler('status'),
            width: "8%"
        },
        {
            id: 'uuid',
            name: 'UUID',
            unique: true,
            onSort: generateSortHandler('uuid'),
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
            id: 'opt_types',
            name: 'Opt-In-Types',
            editable: false,
            customCell: renderOptInTypes,
            CustomHeader: CustomOptInHeader,
            class: "text-center",
            width: "8%"
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

    const resetFilter = () => {
        setTempFilterSetting();
        setSelectedFilterSetting();
        setIsFilterEnabled(false);
        hcpFilterRef.current.multiFilterProps.resetFilter();
        history.push('/information/list/cdp');
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
        const params = new URLSearchParams(location.search);
        const filterID = params.get('filter');
        if(filterID) axios.get(`/api/filter/${filterID}`)
            .then(res => {
                setSelectedFilterSetting(res.data);
                setIsFilterEnabled(true);
                loadHcpProfiles(res.data.settings);
            })
        else {
            const { lastAppliedFilters, lastAppliedLogic } = hcpFilterRef.current.multiFilterProps.values || {};
            const filterSetting = lastAppliedFilters && lastAppliedFilters.length
                ? {
                    filters: lastAppliedFilters,
                    logic: lastAppliedLogic
                }
                : null;
            loadHcpProfiles(filterSetting);
        };
    }, [location]);

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
                        <div>
                            <div className="d-sm-flex justify-content-between align-items-end mt-4">
                                <div>
                                    <h4 className="cdp-text-primary font-weight-bold mb-0 mr-sm-4 mr-1 d-flex">
                                        List of HCP User
                                        
                                    </h4>
                                    <div>
                                        <NavLink className="custom-tab px-3 py-3 cdp-border-primary" to="/information/list/cdp">Customer Data Platform</NavLink>
                                        <NavLink className="custom-tab px-3 py-3 cdp-border-primary" to="/information/list/crdlp">CRDLP</NavLink>                           
                                    </div>
                                </div>
                                <div className="d-flex pt-3 pt-sm-0 mb-2">
                                    <div className="mr-2">
                                        <div>
                                            {hcps.codbase ?
                                                getUuidAuthorities(hcps.codbase).map(authority =>
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
                                    </div>
                                    {countries && hcps['countries'] &&
                                        <React.Fragment>
                                            <button className={`btn cdp-btn-outline-primary mr-2 ${isFilterEnabled ? 'multifilter_enabled' : ''}`} onClick={() => setShow({ ...show, filterSidebar: true })} ><i class="fas fa-filter mr-2"></i> Filter</button>
                                            {/* {isFilterEnabled && <button className="btn cdp-btn-outline-primary mr-3" onClick={resetFilter} ><i class="fas fa-filter mr-2"></i> Reset Filter </button>} */}
                                            <div title={tableDirty ? "Save or reset changes to use filter options" : null}>
                                                <Dropdown className={`ml-auto dropdown-customize mr-2 ${tableDirty ? 'hcp-inline-disable' : ''}`}>
                                                    <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle fixed-width btn d-flex align-items-center">
                                                        <i className="icon icon-filter mr-2 mb-n1"></i> {hcps.codbase && (countries.find(i => i.codbase === hcps.codbase)) ? (countries.find(i => i.codbase === hcps.codbase)).codbase_desc : 'Filter by Country'}
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item className={hcps.codbase === null ? 'd-none' : ''} onClick={() => urlChange(1, 'null', hcps.status, params.get('orderBy'), params.get('orderType'))}>All</Dropdown.Item>
                                                        {
                                                            countries.map((item, index) => (
                                                                hcps.countries.includes(item.country_iso2) &&
                                                                <Dropdown.Item key={index} className={hcps.countries.includes(item.country_iso2) && hcps.codbase === item.codbase ? 'd-none' : ''} onClick={() => urlChange(1, item.codbase, hcps.status, params.get('orderBy'), params.get('orderType'))}>
                                                                    {
                                                                        hcps.countries.includes(item.country_iso2) ? item.codbase_desc : null
                                                                    }
                                                                </Dropdown.Item>
                                                            ))

                                                        }
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </div>
                                            <div title={tableDirty ? "Save or reset changes to use filter options" : null}>
                                                <Dropdown className={`d-flex align-items-center show dropdown rounded pl-2 pr-1 dropdown cdp-bg-secondary text-white dropdown shadow-sm ${tableDirty ? 'hcp-inline-disable' : ''}`}>
                                                    Status
                                                    <Dropdown.Toggle variant="" className="ml-2 cdp-bg-secondary rounded-0 border-left text-white">
                                                        {getSelectedStatus()}
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item className={hcps.status === null ? 'd-none' : ''} onClick={() => urlChange(1, hcps.codbase, null, params.get('orderBy'), params.get('orderType'))}>All</Dropdown.Item>
                                                        <Dropdown.Item className={isAllVerifiedStatus() ? 'd-none' : ''} onClick={() => urlChange(1, hcps.codbase, 'self_verified,manually_verified', params.get('orderBy'), params.get('orderType'))}>All Verified</Dropdown.Item>
                                                        <Dropdown.Item className={hcps.status === 'self_verified' ? 'd-none' : ''} onClick={() => urlChange(1, hcps.codbase, 'self_verified', params.get('orderBy'), params.get('orderType'))}>Self Verified</Dropdown.Item>
                                                        <Dropdown.Item className={hcps.status === 'manually_verified' ? 'd-none' : ''} onClick={() => urlChange(1, hcps.codbase, 'manually_verified', params.get('orderBy'), params.get('orderType'))}>Manually Verified</Dropdown.Item>
                                                        <Dropdown.Item className={hcps.status === 'consent_pending' ? 'd-none' : ''} onClick={() => urlChange(1, hcps.codbase, 'consent_pending', params.get('orderBy'), params.get('orderType'))}>Consent Pending</Dropdown.Item>
                                                        <Dropdown.Item className={hcps.status === 'not_verified' ? 'd-none' : ''} onClick={() => urlChange(1, hcps.codbase, 'not_verified', params.get('orderBy'), params.get('orderType'))}>Not Verified</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </div>
                                        </React.Fragment>
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
                                    <div className="px-4 py-3">
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
                            <Modal

                                show={show.updateStatus}
                                onShow={getConsentsForCurrentUser}
                                onHide={() => { setShow({ ...show, updateStatus: false }) }}
                                dialogClassName="modal-customize"
                                aria-labelledby="example-custom-modal-styling-title"
                                centered
                                size="lg"
                            >
                                <Modal.Header closeButton>
                                    <Modal.Title id="example-custom-modal-styling-title">
                                        Status Update
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <div className="p-3">
                                        <div className="row">
                                            <div className="col">
                                                <h4 className="font-weight-bold">{`${currentUser.first_name} ${currentUser.last_name}`}</h4>
                                                <div className="mt-1">{currentUser.email}</div>
                                                <div className="mt-1 pb-2">{(new Date(currentUser.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')}</div>
                                            </div>
                                        </div>
                                        <div>
                                            <h5 className="font-weight-bold my-3">Consents: </h5>
                                            <div className="row pb-3">
                                                <div className="col">
                                                    {currentUser.consents && currentUser.consents.length ?
                                                        currentUser.consents.map(consent => {
                                                            return consent.consent_given && <div className="pb-1" key={consent.id} >
                                                                <i className={`icon ${consent.consent_given ? 'icon-check-filled' : 'icon-close-circle text-danger'} cdp-text-primary mr-2 small`}></i>{consent.preference}
                                                            </div>
                                                        })
                                                        : <div className="alert alert-warning">The HCP has not given any consent.</div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <Formik
                                            initialValues={{
                                                comment: '',
                                                selectedStatus: '',
                                                other_comment: ''
                                            }}
                                            displayName="ApproveRejectForm"
                                            validationSchema={ApprovalRejectSchema}
                                            onSubmit={(values, actions) => {
                                                if (values.selectedStatus === 'approve') {
                                                    if (values.comment === 'other') values.comment = values.other_comment;
                                                    axios.put(`/api/hcp-profiles/${currentUser.id}/approve`, { comment: values.comment })
                                                        .then(() => onUpdateStatusSuccess())
                                                        .catch(err => onUpdateStatusFailure(err))
                                                }
                                                if (values.selectedStatus === 'reject') {
                                                    axios.put(`/api/hcp-profiles/${currentUser.id}/reject`, values)
                                                        .then(() => onUpdateStatusSuccess())
                                                        .catch(err => onUpdateStatusFailure(err))
                                                }
                                                actions.setSubmitting(false);
                                                actions.resetForm();
                                                setShow({ ...show, updateStatus: false });
                                            }}
                                        >
                                            {formikProps => (
                                                <Form onSubmit={formikProps.handleSubmit}>
                                                    <div className="row">
                                                        <div className="col-6">
                                                            <a
                                                                className={`btn btn-block cdp-btn-outline-primary mt-4 p-2 font-weight-bold ${formikProps.values.selectedStatus === 'approve' ? 'selected' : ''}`}
                                                                onClick={() => {
                                                                    if (formikProps.values.selectedStatus !== 'approve') {
                                                                        formikProps.setFieldValue('selectedStatus', 'approve');
                                                                        formikProps.setFieldValue('comment', '');
                                                                        formikProps.setFieldValue('other_comment', '');
                                                                        formikProps.setFieldTouched('comment', false);
                                                                        formikProps.setFieldTouched('other_comment', false);
                                                                    }
                                                                }}
                                                            >
                                                                Approve User
                                                            </a>
                                                        </div>
                                                        <div className="col-6">
                                                            <a
                                                                onClick={() => {
                                                                    if (formikProps.values.selectedStatus !== 'reject') {
                                                                        formikProps.setFieldValue('selectedStatus', 'reject');
                                                                        formikProps.setFieldValue('comment', '');
                                                                        formikProps.setFieldValue('other_comment', '');
                                                                        formikProps.setFieldTouched('comment', false);
                                                                        formikProps.setFieldTouched('other_comment', false);
                                                                    }
                                                                }}
                                                                className={`btn btn-block cdp-btn-outline-danger mt-4 p-2 font-weight-bold  ${formikProps.values.selectedStatus === 'reject' ? 'selected' : ''}`}
                                                            >
                                                                Reject User
                                                            </a>
                                                        </div>
                                                    </div>
                                                    {formikProps.values.selectedStatus === 'approve' && <div className="row mt-4">
                                                        <div className="col-12 col-sm-12">
                                                            <div className="form-group mb-0">
                                                                <label className="font-weight-bold" htmlFor="comment">Comment <span className="text-danger">*</span></label>
                                                                <div className="custom-control custom-radio pb-2">
                                                                    <Field className="custom-control-input" id="UUIDmanually" data-testid='comment' type="radio" name="comment" value="HCP User did a mistake in typing UUID manually" />
                                                                    <label className="custom-control-label font-weight-bold" for="UUIDmanually"> HCP User did a mistake in typing UUID manually</label>
                                                                </div>
                                                                <div className="custom-control custom-radio pb-2">
                                                                    <Field className="custom-control-input" data-testid='comment' type="radio" id="PharmaCompanies" name="comment" value="HCP User has exclusivity with other Pharma Companies" />
                                                                    <label className="custom-control-label font-weight-bold" for="PharmaCompanies">HCP User has exclusivity with other Pharma Companies</label>
                                                                </div>
                                                                <div className="custom-control custom-radio pb-2">
                                                                    <Field className="custom-control-input" data-testid='comment' id="OneKeypopulation" type="radio" name="comment" value="HCP User is not in the customers IQVia OneKey population" />
                                                                    <label className="custom-control-label font-weight-bold" for="OneKeypopulation">HCP User is not in the customers IQVia OneKey population</label>
                                                                </div>
                                                                <div className="custom-control custom-radio pb-2">
                                                                    <Field className="custom-control-input" data-testid='comment' id="Other" type="radio" rows="4" name="comment" value="other" />
                                                                    <label className="custom-control-label font-weight-bold" for="Other">Other:</label>
                                                                </div>
                                                                <div>
                                                                    {formikProps.values.comment === 'other' &&
                                                                        <>
                                                                            <Field className="form-control" data-testid='comment' component="textarea" rows="4" name="other_comment" />
                                                                            <div className="invalid-feedback"><ErrorMessage name="other_comment" /></div>
                                                                        </>
                                                                    }
                                                                </div>
                                                                <div className="invalid-feedback"><ErrorMessage name="comment" /></div>
                                                            </div>
                                                        </div>
                                                    </div>}
                                                    {formikProps.values.selectedStatus === 'reject' && <div className="row mt-4">
                                                        <div className="col-12 col-sm-12">
                                                            <div className="form-group mb-0">
                                                                <label className="font-weight-bold" htmlFor="comment">Comment <span className="text-danger">*</span></label>
                                                                <div>
                                                                    <Field className="form-control" data-testid='comment' component="textarea" rows="4" name="comment" />
                                                                </div>
                                                                <div className="invalid-feedback"><ErrorMessage name="comment" /></div>
                                                            </div>
                                                        </div>
                                                    </div>}
                                                    <button type="submit" data-testid='submit' className="btn btn-block text-white cdp-btn-secondary mt-5 p-2" disabled={!formikProps.values.selectedStatus || formikProps.isSubmitting}>Save Changes</button>
                                                </Form>
                                            )}
                                        </Formik>
                                    </div>
                                </Modal.Body>

                            </Modal>

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
                />
            </div>
        </main >
    );
}
