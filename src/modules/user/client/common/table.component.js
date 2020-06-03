import React from 'react';
import TableHeader from './table-header.component.'
import TableBody from './table-body.component';

const Table = ({ columns, sortColumn, onSort, data }) => {
  return (
    <table className="table">
      <TableHeader columns={columns} sortColumn={sortColumn} onSort={onSort}/>
      <TableBody columns={columns} data={data} />
    </table>
  );
}
 
export default Table;