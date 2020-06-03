import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Table from '../common/table.component'
import ShowEntries from '../common/show-entries.component'
import Pagination from '../common/pagination.component'
import searchByQuery from '../../../util/searchbyquery'
import paginate from '../../../util/paginate'
import Search from '../common/search.component'
import _ from 'lodash'

import { 
    getSiteAdminList, 
    changeSiteAdminAccountStatus, 
    deleteSiteAdminAccount 
} from '../user.actions'

export default function Users() {
    const dispatch = useDispatch()

    const [sortColumn, setSortColumn] = useState({ path: 'id', order: 'asc' });
    const [pageSize, setPageSize] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);
    const users = useSelector(state => state.userReducer.siteAdmins);

    useEffect( () => {
        dispatch(getSiteAdminList())
    }, [])

    const handlePageChange = (page) => setCurrentPage(page)

    const handleSort = sort => setSortColumn(sort)

    const handleEntryChange = (value) => {
        setPageSize(value)
        if(value >= users.length) setCurrentPage(1)
    }

    const handleStatusClick = ({ email, is_active }) => {
        dispatch(changeSiteAdminAccountStatus({ email, is_active: !is_active }) )
    }

    const handleDeleteClick = ({ email }) => {
        if (window.confirm("Are you sure?")) {
            dispatch(deleteSiteAdminAccount({ email }))
        }
    }

    const getStatus = ({ email, is_active }) => (
        <label 
            style={{ cursor: 'pointer' }}
            className="switch" 
            onClick={() => handleStatusClick({ email, is_active }) } 
        >
            <input type="checkbox" checked={is_active} /> 
            <span className="slider round">{ is_active == 1 ? " Active" : " Disabled" }</span>
        </label>
    )

    const getAction = ({ email }) => (
        <svg 
            onClick={() => handleDeleteClick({ email }) } 
            style={{ cursor: 'pointer' }} 
            class="bi bi-trash" 
            width="1em" 
            height="1em" 
            viewBox="0 0 16 16" 
            fill="currentColor" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
        </svg>
    )

    const columns = [
        { path: 'id', label: '#' },
        { path: 'name', label: 'Name' },
        { path: 'email', label: 'Email' },
        { 
            path: '',
            label: 'Status',
            content: user => getStatus(user)
        },
        { 
          key: '',
          label: 'Action',
          content: user => getAction(user)
        }
    ]

    const getPageDate = () => {
        const filtered = searchByQuery(users, columns, searchQuery)
    
        const paginated = paginate(filtered, currentPage, pageSize)
    
        const sorted = _.orderBy(paginated, [sortColumn.path], [sortColumn.order])
    
        return { totalCount: filtered.length, data: sorted }
    }
    
    const { totalCount, data: usersList } = getPageDate()


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
                            <h6 className="mr-3 mb-0 text-white d-inline-block">{loggedInUser.name}</h6><a className="btn btn-danger" href="/logout">Logout</a>
                        </div>
                    </div>
                </div>
            </header>
            <div className="app__content">
                <Breadcrumb>
                    <Breadcrumb.Item href="/">
                        Dashboard
                    </Breadcrumb.Item>
                    <Breadcrumb.Item active>User and Permission Service</Breadcrumb.Item>
                </Breadcrumb>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h2 className="">User list</h2>
                                    <NavLink to="/users/create" className="btn btn-primary ml-auto">
                                        Create new user
                                    </NavLink>
                                </div>

                                <br/>
                                <Search 
                                    onChange={ e => setSearchQuery(e.target.value)} 
                                    placeholder="Search by keyword" 
                                />

                                <br/>
                                <ShowEntries 
                                    handleEntryChange={handleEntryChange} 
                                    highValue={totalCount}
                                /> <br/>

                                <Table 
                                    data={usersList} 
                                    columns={columns}
                                    sortColumn={sortColumn}
                                    onSort={handleSort}
                                />

                                <Pagination 
                                    itemsCount={totalCount} 
                                    pageSize={pageSize} 
                                    currentPage={currentPage}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </main>
    );
}
