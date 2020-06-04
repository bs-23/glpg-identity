import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Table from '../../../core/client/common/table.component'
import Pagination from '../../../core/client/common/pagination.component'
import paginate from '../../../core/client/util/paginate'
import _ from 'lodash'

import { 
    getSiteAdminList, 
    deleteSiteAdminAccount 
} from '../user.actions'

export default function Users() {
    const dispatch = useDispatch()

    const [sortColumn, setSortColumn] = useState({ path: 'id', order: 'asc' });
    const [pageSize, setPageSize] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);
    const siteAdmins = useSelector(state => state.userReducer.siteAdmins); 
    const users = siteAdmins.filter(siteAdmin => {
        if(searchQuery === 'Active') { 
            if(siteAdmin.is_active) return true;
            return false;
        }
        if(searchQuery === 'Inactive') {
            if(!siteAdmin.is_active) return true;
            return false
        }
        return true;
    })
    

    useEffect( () => {
        dispatch(getSiteAdminList())
    }, [searchQuery])

    const handleFilterClick = (e, query) => {
        e.preventDefault();
        
        setSearchQuery(query)
    }

    const handlePageChange = (page) => setCurrentPage(page)

    const handleSort = sort => setSortColumn(sort)

    const handleDeleteClick = ({ email }) => {
        if (window.confirm("Are you sure?")) {
            dispatch(deleteSiteAdminAccount({ email }))
        }
    }

    const getStatus = ({ is_active }) => (
        <span className={is_active ? 'active' : 'inactive' }>{ is_active == 1 ? " Active" : " Inactive" }</span>
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

    const getSign = () => (
        <svg 
            class="bi bi-chevron-right" 
            width="1em" 
            height="1em" 
            viewBox="0 0 16 16" 
            fill="currentColor" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
        </svg>
    )

    const columns = [
        { path: 'name', label: 'Name' },
        { path: 'email', label: 'Email' },
        { path: 'phone', label: 'Phone' },
        { 
            key: 'status',
            label: 'Status',
            content: user => getStatus(user)
        },
        { 
          key: 'action',
          label: 'Action',
          content: user => getAction(user)
        },
        {
            key: 'left_sign',
            content: () => getSign()
        }
    ]

    const getPageDate = () => {
        const paginated = paginate(users, currentPage, pageSize)
    
        const sorted = _.orderBy(paginated, [sortColumn.path], [sortColumn.order])
    
        return { totalCount: users.length, data: sorted }
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

                                    <Dropdown className="ml-auto">
                                        <Dropdown.Toggle variant="light" id="dropdown-basic" className="mt-2">
                                        <svg class="bi bi-filter" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd" d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
                                        </svg>
                                            Filter
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item 
                                                onClick={e => handleFilterClick(e, 'Active')}
                                            >
                                                Active
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={e => handleFilterClick(e, 'Inactive')}
                                            >
                                                Inactive
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={ e => handleFilterClick(e, '')}
                                            >
                                                None
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    
                                    <NavLink to="/users/create" className="btn btn-primary ml-auto">
                                        Create new user
                                    </NavLink>
                                </div>

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
