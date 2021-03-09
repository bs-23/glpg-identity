import { NavLink, useLocation, useHistory } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useToasts } from 'react-toast-notifications';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import StoryForm from './clinical-trials-story-form.component';
import {getTrialItems, getClinicalTrialDetails, getTrialConditions,getMultipleClinicalTrialDetails } from './clinical-trials.actions';
import './trials.scss'
var dumpData =  function() {
    const url = `/api/clinical-trials`;
    var urlToGetData = prompt("urlToGetData:", "https://clinicaltrials.gov/api/query/full_studies?expr=%28gilead+%5BLeadSponsorName%5D+AND+filgotinib+%5BInterventionName%5D+AND+NOT+Phase+1%5BPhase%5D%29+OR+%28galapagos+%5BLeadSponsorName%5D+AND+NOT+Phase+1%5BPhase%5D%29%0D%0A&min_rnk=1&max_rnk=100&fmt=json");
    return {
        payload: axios({
            method: 'post',
            url,
            data: {
                "urlToGetData": urlToGetData,
                "description": "all data from glpg nv"
              }
        }).then(out=>console.log(out))
    };
}

var showAllVersions =  function() {
    const url = `/api/clinical-trials/versions`;

    return {
        payload: axios({
            method: 'get',
            url
        }).then(out=>console.log(out))
    };
}

var showAllClinicalTrials =  function() {
    const url = `/api/clinical-trials-cdp`;

    return {
        payload: axios({
            method: 'get',
            url
        }).then(out=>console.log('object data-->',out))
    };
}

var mergeProcessData =  function() {
    const url = `/api/clinical-trials/merge-versions`;

    var ids = prompt("Ids:", "f5dc122a-5a78-4d5a-98af-0708db00c398,d8a43180-2246-46bd-b2ee-7f5e579b2d28");

    return {
        payload: axios({
            method: 'post',
            url,
            data: {
                "ids": ids
              }
        }).then(out=>console.log(out))
    };
}

var update_clinicalTrials =  function() {
    const url = `/api/clinical-trials/update`;

    var story_telling = prompt("your story :", "dummy story");
    var trial_fixed_id = prompt("id :", "f5dc122a-5a78-4d5a-98af-0708db00c398");

    return {
        payload: axios({
            method: 'put',
            url,
            data: [
                {
                    story_telling,
                    trial_fixed_id
                }
            ]
        }).then(out=>console.log(out))
    };
}

var syncGeocodes =  function() {
    const url = `/api/clinical-trials/sync-geocodes`;
    return {
        payload: axios({
            method: 'post',
            url,
            data: {
              }
        }).then(out=>console.log(out))
    };
}


function checkUncheck(trial_fixed_ids, setTo) {
    var c = document.getElementsByTagName('input');

    for (var i = 0; i < c.length; i++) {
        if (c[i].type == 'checkbox' && trial_fixed_ids.includes(c[i].id)) {
            c[i].checked = setTo;
        }
    }
    
    
}


const ClinicalTrials = (props) => {
    const isFilterEnabled = false;
    const trialItems = useSelector(state => state.clinicalTrialsReducer);
    const trialConditions = useSelector(state => state.clinicalTrialsReducer.trialConditions.data);
    const { addToast } = useToasts();
    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);
    const [profileDetails, setProfileDetails] = useState(null);
    const [sort, setSort] = useState({ type: 'asc', value: null });
    const [show, setShow] = useState(false);
    const [addMode, setAddMode] = useState(false);
    const [selectedTrials, setSelectedTrials] = useState([]);
    const addDataSample = {
        title: 'Sample Title',
        trials : [1,2,3],
        version: 'v1',
        story: 'sample story',
        story_plaintext: 'sample story plain text'
    }
    let [hcpUsers, setHcpUsers] = useState({
        users: [
            {
                firstname: 'test1',
                lastname: 'test2'
            },
            {
                firstname: 'test3',
                lastname: 'test4'
            },
            {
                firstname: 'test5',
                lastname: 'test6'
            }
        ]
    });
    const allCountries = useSelector(state => state.countryReducer.allCountries);
    const trialDetails = useSelector(state => state.clinicalTrialsReducer.trialDetails);
    const dispatch = useDispatch();
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

    const toggleAllBoxes = ()=>{
        var elements = document.getElementsByTagName('input');
        const arr = []
        let setTo = true;
        for(var i = 0; i < elements.length; i++){
            if(elements[i].type == 'checkbox') 
            { if(elements[i].id =='checkAll'){
                console.log('main box:',elements[i].checked);
                !elements[i].checked ? setTo = false : null 
            }else{arr.push(elements[i].id)}
            
            }
        }
        checkUncheck(arr,setTo);
        setTo ? setSelectedTrials(arr) : setSelectedTrials([]);
        
    }
    
    const selectedUnmarkedTrial = (trial_fixed_id)=>{
        var elements = document.getElementsByTagName('input');
        const trial_fixed_ids = []
    
        for(var i = 0; i < elements.length; i++){
            if(elements[i].type == 'checkbox' && elements[i].id !='checkAll' && elements[i].id !=trial_fixed_id ) 
            { trial_fixed_ids.push(elements[i].id)
            }
            
            }
        

        if(!selectedTrials.includes(trial_fixed_id)) 
            {
                const arr = [];
                arr.push(trial_fixed_id);
                setSelectedTrials(arr);
                checkUncheck(trial_fixed_ids,false);
                checkUncheck([trial_fixed_id], true);
                console.log('after insert in unmarked region: ',selectedTrials);
            }
        }

    const updateSelectedTrials = (trial_fixed_ids)=>{
        
        if(!selectedTrials.includes(trial_fixed_ids)) 
            {
                const arr = selectedTrials;
                arr.push(trial_fixed_ids);
                setSelectedTrials(arr);
                console.log('after insert: ',selectedTrials);
            }
            else
            {
                const arr = selectedTrials.filter(item => item !== trial_fixed_ids);
                setSelectedTrials(arr);
                console.log('after remove: ',selectedTrials);
            }
    }

    useEffect(() => {
        dispatch(getTrialItems());
        dispatch(getTrialConditions());
    },[]);

    useEffect(() => {
        dispatch(getTrialItems());
    },[show]);

    const [filteredTopic, setFilter] = useState('All');
    const [story, setStory] = useState('write a story');
    const topic = false;
   


    return (
        <main className="app__content cdp-light-bg">
            <div  className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav className="breadcrumb justify-content-between align-items-center" aria-label="breadcrumb">
                            <ol className="rounded-0 m-0 p-0 d-none d-sm-flex">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/information">Clinical Trials</NavLink></li>
                                <li className="breadcrumb-item active"><span>Trials</span></li>
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
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center py-3  cdp-table__responsive-sticky-panel">
                             <h4 className="cdp-text-primary font-weight-bold mb-0 mb-sm-0 d-flex align-items-end pr-2">
                             Manage Content For Each Clinical Trial
                                
                            </h4>



                            <div className="d-flex pt-3 pt-sm-0 mb-2">
                                <Dropdown className="ml-auto dropdown-customize">
                                        <Dropdown.Toggle variant className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center">
                                            <i className="icon icon-filter mr-2 mb-n1"></i> <span className="d-none d-sm-inline-block">{filteredTopic==='All' ? 'Filter by Condition' : filteredTopic}</span>
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {trialConditions.length > 0 && filteredTopic!=='All' && <Dropdown.Item href={`#`} onClick={()=>{setFilter('All');}}>All</Dropdown.Item>}

                                            {
                                                trialConditions.length > 0 && trialConditions.map((item, index) => (
                                                    item !== topic && <Dropdown.Item href={`#`} onClick={()=>{setFilter(item);}} key={index}>{item}</Dropdown.Item>
                                                ))
                                            }
                                        </Dropdown.Menu>
                                </Dropdown>

                                
                                <button className={`btn  ${isFilterEnabled ? 'multifilter_enabled cdp-btn-primary text-white' : 'cdp-btn-outline-primary'}`} onClick={() => setShowFilterSidebar(true)} >
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
                            </div>
                        </div>

                    
                        { trialItems['clinialTrial_items'] && trialItems.clinialTrial_items.data.search_result.length > 0 &&
                            <React.Fragment>
                                <div className="table-responsive shadow-sm bg-white">
                                    <table className="table table-hover table-sm mb-0 cdp-table">
                                        <thead className="cdp-bg-primary text-white cdp-table__header">
                                            <tr>
                                                 <th width="10%">
                                                    <div className="custom-control custom-checkbox without-bg">
                                                        <input type="checkbox" className="custom-control-input" id="checkAll" onClick={()=>{toggleAllBoxes()}} />
                                                        <label className="custom-control-label" for="checkAll"></label>
                                                    </div>
                                                </th>
                                                <th width="10%"><span className={sort.value === 'firstname' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(1, codBase, 'firstname')}>Clinical Gov. ID<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>

                                                <th width="25%"><span className={sort.value === 'lastname' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(1, codBase, 'lastname')}>Study Title<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>

                                                <th width="10%"><span className={sort.value === 'ind_status_desc' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(1, codBase, 'ind_status_desc')}>Conditions<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>

                                                <th width="7%"><span className={sort.value === 'uuid_1' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(1, codBase, 'uuid_1')}>Phase<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>

                                                <th width="7%"><span className={sort.value === 'individual_id_onekey' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(1, codBase, 'individual_id_onekey')}>Gender<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>

                                                <th width="7%"><span className={sort.value === 'country_iso2' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => urlChange(1, codBase, 'country_iso2')}>Trial Status<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>

                                                <th width="7%">Age</th>

                                                <th width="7%">Actual Number of Enrolled</th>

                                                <th width="7%">%</th>

                                                <th width="7%">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="cdp-table__body bg-white">
                                            {trialItems.clinialTrial_items.data.search_result.map((row, idx) =>{return (row.indication_group ===filteredTopic || filteredTopic ==='All' ) ? (   
                                                <tr key={'user-' + idx}>
                                                    <td>
                                                        <div className="custom-control custom-checkbox">
                                                            <input type="checkbox" className="custom-control-input" id={row.trial_fixed_id} onClick={()=>{updateSelectedTrials(row.trial_fixed_id)}}/>
                                                            <label className="custom-control-label" for={row.trial_fixed_id}></label>
                                                        </div>
                                                    </td>
                                                    <td className="text-break">{row.gov_identifier || '--'}</td>
                                                    <td className="text-break">{row.clinical_trial_brief_title || '--'}
                    
                                                    </td>
                                                    <td>
                                                        {row.ind_status_desc ?
                                                            <span>
                                                                <i className={`fa fa-xs fa-circle ${(row.ind_status_desc || '').toLowerCase() === 'valid' ? 'text-success' : 'text-danger'} pr-2 hcp-status-icon`}></i>
                                                                {row.ind_status_desc}
                                                            </span>
                                                            : row.indication
                                                        }
                                                    </td>
                                                    <td className="text-break">{row.phase.match(/\d+/)[0]}</td>
                                                    <td className="text-break">{row.gender}</td>
                                                    <td>{getCountryName(row.country_iso2) || row.trial_status}</td>
                                                    <td>
                                                        {row.max_age == null ?
                                                            (row.min_age + '+')
                                                            : (row.min_age + '-' + row.max_age)
                                                        }
                                                    </td>
                                                    <td className="text-break" >{'--'}</td>
                                                    <td className="text-break" >{'--'}</td>
                                    
                                                    <td data-for="Action"><Dropdown className="ml-auto dropdown-customize">
                                                    <Dropdown.Toggle variant className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1 dropdown-toggle"></Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item onClick={() => { setShow(true); setAddMode(true); setStory(row.story_telling); selectedUnmarkedTrial(row.trial_fixed_id)}}>
                                                            Write Story
                                                        </Dropdown.Item>
                                                        <Dropdown.Item onClick={() => { setShow(true); setAddMode(false); setStory(row.story_telling);}}>
                                                            Edit Story
                                                        </Dropdown.Item>
                                                        <Dropdown.Item className="text-danger bg-white" onClick={() => { setShowDelete(true); setDeleteId(row.id); }}>Delete</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown></td>

                                                </tr>
                                            ): null })}
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
                        {show ? <StoryForm story={story} selectedTrials ={selectedTrials} trialDetails={trialDetails} addMode={addMode} changeShow={(val) => setShow(val)} show={show} trialIDs={[1,2,3]} addData = {addDataSample} /> : null}
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
                                                <div className="mt-1 font-weight-bold">Email</div>
                                                <div className="text-capitalize">{profileDetails.email_1 || '--'}</div>
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Individual Onekey ID</div>
                                                <div className="">{profileDetails.individual_id_onekey || '--'}</div>
                                            </div>
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Activity Onekey ID</div>
                                                <div className="">{profileDetails.activity_id_onekey || '--'}</div>
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Address Onekey ID</div>
                                                <div className="">{profileDetails.adr_id_onekey || '--'}</div>
                                            </div>
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Workplace Onekey ID</div>
                                                <div className="text-capitalize">{profileDetails.workplace_id_onekey || '--'}</div>
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
                                                    {profileDetails.ind_status_desc ?
                                                        <span>
                                                            <i className={`fa fa-xs fa-circle ${(profileDetails.ind_status_desc || '').toLowerCase() === 'valid' ? 'text-success' : 'text-danger'} pr-2 hcp-status-icon`}></i>
                                                            {profileDetails.ind_status_desc}
                                                        </span>
                                                        : '--'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </Modal.Body>
                        </Modal>
                    </div>
                </div>
                {/* <HCPFilter
                    ref={hcpFilterRef}
                    show={showFilterSidebar}
                    selectedFilterSetting={selectedFilterSetting}
                    onHide={() => setShowFilterSidebar(false)}
                    onExecute={handleFilterExecute}
                    tableName="crdlp-hcp-profiles"
                    selectedScopeKey={'scope-hcp'}
                /> */}
                <div>
                    <button onClick={dumpData}>Dump Data</button>
                    <button onClick={showAllVersions}>Show All Versions</button>
                    <button onClick={mergeProcessData}>Merge</button>
                    <button onClick={syncGeocodes}>Sync Geocodes</button>
                    <button onClick={showAllClinicalTrials}>Show All Clinical Trials</button>
                    <button onClick={update_clinicalTrials}>Update Clinical Trials</button>
                    <button onClick={getClinicalTrialDetails}>Show trial details</button>
                    <button onClick={()=>{checkUncheck('NCT04578548',true)}}>Check Uncheck</button>
                    
                </div>
                <div class="tooltip">Hover over me
                        <span class="tooltiptext">Tooltip text</span>
                </div>
            </div>
        </main>
    

    );
}

export default ClinicalTrials;
