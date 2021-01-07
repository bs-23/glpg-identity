import React from 'react';

export default function (props) {
    const { onClick, label, className, style, disabled } = props;

    return <button style={style} className={className} onClick={onClick} disabled={disabled} >
        {label}
    </button>
}
