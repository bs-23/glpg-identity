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
                    Showing {startCount} to{" "}
                    {endCount <= itemsCount ? endCount : itemsCount} of{" "}
                    {itemsCount} entries
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
                            id="users-contacts_previous"
                        >
                            <a
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
                                {" "}
                                Previous{" "}
                            </a>
                        </li>

                        {pages.map((page) => (
                            <li
                                key={page}
                                className={
                                    page === currentPage
                                        ? "paginate_button page-item active"
                                        : "paginate_button page-item"
                                }
                            >
                                <a
                                    className="page-link"
                                    style = {{ cursor: 'pointer' }}
                                    onClick={() => onPageChange(page)}
                                >
                                    {" "}
                                    {page}{" "}
                                </a>
                            </li>
                        ))}

                        <li
                            className="paginate_button page-item next"
                            id="users-contacts_next"
                        >
                            <a
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
                                {" "}
                                Next{" "}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
