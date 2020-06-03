import React from 'react';
import _ from 'lodash'

const TableBody = (props) => {

  const renderCell = (item, column) => {
    if(column.content) return column.content(item)
    return _.get(item, column.path)
  }
  
  const createKey = (item, column) => item.id + (column.path || column.key)

  const { data, columns } = props

  return (
    <tbody>
      {data.map( item => (
        <tr key={item.id}>
          {columns.map( column => (
            <td key={createKey(item, column)}>
              {renderCell(item, column)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
 
export default TableBody;