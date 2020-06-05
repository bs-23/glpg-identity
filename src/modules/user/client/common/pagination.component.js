import React from "react";
import _ from "lodash";

const Pagination = (props) => {
    const { itemsCount, pageSize, currentPage, onPageChange } = props;
    const pagesCount = Math.ceil(itemsCount / pageSize);
    if (itemsCount <= pageSize) return null;
    const pages = _.range(1, pagesCount + 1);
    const startCount = (currentPage - 1) * pageSize + 1;
    const endCount = startCount + pageSize - 1;

    return (
        <div className="row">
            <div className="col-sm-12 col-md-5">
                <div className="dataTables_info" id="users-contacts_info">
                    {startCount} - {" "}
                    {endCount <= itemsCount ? endCount : itemsCount} of{" "}
                    {itemsCount}
                </div>
            </div>

            <div className="col-sm-12 col-md-7">
                <div
                    className="dataTables_paginate paging_simple_numbers"
                    id="users-contacts_paginate"
                >
                    

                    <ul className="pagination">
                        <li
                            className="paginate_button page-item previous"
                        >
                            <span
                                className="page-link"
                                style = {{ cursor: 'pointer' }}
                                onClick={() =>
                                    onPageChange(
                                        currentPage != 1
                                            ? currentPage - 1
                                            : currentPage
                                    )
                                }
                            >
                                <svg 
                                    class="bi bi-chevron-left" 
                                    width="1em" 
                                    height="1em" 
                                    viewBox="0 0 16 16" 
                                    fill="currentColor" 
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                                </svg>
                            </span>
                        </li>


                        <li
                            // className="paginate_button page-item next"
                        >
                            <span
                                className="page-link"
                                style = {{ cursor: 'pointer' }}
                                onClick={() =>
                                    onPageChange(
                                        currentPage != pagesCount
                                            ? currentPage + 1
                                            : currentPage
                                    )
                                }
                            >
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
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
