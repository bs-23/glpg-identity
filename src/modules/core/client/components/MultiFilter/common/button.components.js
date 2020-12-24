import React from 'react';

export default function (props) {
    const { onClick, label, className, style } = props;

    return <button style={style} className={className} onClick={onClick}>
        {label}
    </button>
}
