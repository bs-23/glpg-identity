import React from 'react';

const Header = ({ columns, dirty }) => {

    return <thead className="cdp-bg-primary text-white cdp-table__header">
        <tr>
            {columns && columns.map(col => <th key={col.name} >
                <span>{col.name}</span>
                {col.onSort && !dirty && <i onClick={col.onSort} className="ml-2 icon icon-history icon-1x cdp-list-group__icon"></i>}
            </th>)}
        </tr>
    </thead>
}

export default Header;
