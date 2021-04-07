import React from 'react';

const Cell = ({ value, onSwitchToEditMode, editable = true }) => {
    return <div className="d-flex d-sm-block justify-content-between">
        <span>{value}</span>
        {editable && <i
            className="icon icon-edit-pencil icon-1x inline-editing__edit-icon ml-2"
            onClick={(e) => onSwitchToEditMode(e)}
        />}
    </div>
}

export default Cell;
