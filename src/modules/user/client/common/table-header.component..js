import React from 'react';

// columns: array
// sortColumn: object
// onSort: function

const TableHeader = (props) => {
  const raiseSort = path => {
    if(!path) return null

    const sortColumn = { ...props.sortColumn }
    if(sortColumn.path === path) 
      sortColumn.order = sortColumn.order === 'asc' ? 'desc' : 'asc'
    else{
      sortColumn.path = path
      sortColumn.order = 'asc'
    }
    props.onSort(sortColumn)
  }

  const renderSortIcon = (column) => {
    if(!column.path || (column.path !== props.sortColumn.path)) return null
    if(props.sortColumn.order === 'asc') {
        return (
            <svg class="bi bi-caret-up" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M3.204 11L8 5.519 12.796 11H3.204zm-.753-.659l4.796-5.48a1 1 0 0 1 1.506 0l4.796 5.48c.566.647.106 1.659-.753 1.659H3.204a1 1 0 0 1-.753-1.659z"/>
            </svg>
        )
    }
    return (
        <svg class="bi bi-caret-down" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M3.204 5L8 10.481 12.796 5H3.204zm-.753.659l4.796 5.48a1 1 0 0 0 1.506 0l4.796-5.48c.566-.647.106-1.659-.753-1.659H3.204a1 1 0 0 0-.753 1.659z"/>
        </svg>
    )
  }

  return (
    <thead className="table-secondary">
      <tr>
        { props.columns.map(column => (
          <th 
            scope="col"
            style={{ cursor: 'pointer' }}
            key={column.path || column.key} 
            onClick={() => raiseSort(column.path)}
          >
            {column.label} {renderSortIcon(column)}
          </th>
        ))}
      </tr>
    </thead>
  );
}
 
export default TableHeader;