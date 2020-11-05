import React from 'react';

const Header = ({ columns, dirty }) => {
    return <thead className="cdp-bg-primary text-white cdp-table__header">
        <tr>
            {columns && columns.map(col => <th width={col.width} className={col.class} key={col.name} >
                <span className="cdp-table__col-sorting">
                    {col.name}
                    {col.onSort && !dirty && <i onClick={col.onSort} className="icon icon-sort cdp-table__icon-sorting"></i>}
                </span>
                
            </th>)}
        </tr>
    </thead>
}

export default Header;
