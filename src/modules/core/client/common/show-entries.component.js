import React from 'react';

const ShowEntries = (props) => {

  const { highValue, handleEntryChange } = props

  return (
    <div className="row">
      <div className="col-sm-12 col-md-12">
        <label>
          Show{" "}
          <select
            name="groupTable_length"
            aria-controls="groupTable"
            className=""
            onChange={({ currentTarget: input }) => handleEntryChange(input.value)}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value={ highValue }> All </option>
          </select>{" "}
          entries
        </label>
      </div>
    </div>
  );
}
 
export default ShowEntries;