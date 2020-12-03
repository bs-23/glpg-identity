import React from 'react';

const Header = ({ columns, dirty, sortOn, sortType }) => {
    const isSortedClass = `cdp-table__col-sorting sorted ${sortType && sortType.toLowerCase()}`;
    const sortClass = 'cdp-table__col-sorting';

    return <thead className="cdp-bg-primary text-white cdp-table__header">
        <tr>
            {columns && columns.map(col => <th width={col.width} className={col.class} key={col.name} >
                {col.CustomHeader
                    ? <col.CustomHeader />
                    : <span className={col.id === sortOn ? isSortedClass : sortClass} >
                        {col.name}
                        {col.onSort && !dirty && <i onClick={col.onSort} className="icon icon-sort cdp-table__icon-sorting"></i>}
                    </span>
                }
            </th>)}
        </tr>
    </thead>
}

export default Header;
