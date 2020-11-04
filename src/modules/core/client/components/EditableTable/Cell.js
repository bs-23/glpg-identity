import React from 'react';

const Cell = ({ value, onSwitchToEditMode, showEditIcon, editable }) => {
    const shouldShowEditIcon = editable !== false && showEditIcon;

    return <div>
        <span>{value}</span>
        <i
            className="icon icon-edit-pencil icon-1x cdp-list-group__icon"
            style={{ marginLeft: '5px', fontSize: '10' }}
            onClick={(e) => onSwitchToEditMode(e)}
        />
    </div>
}

export default Cell;
