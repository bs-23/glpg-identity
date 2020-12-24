import React from 'react';

function formatDate(date) {
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 101).toString().substring(1);
    var day = (date.getDate() + 100).toString().substring(1);
    return year + "-" + month + "-" + day;
}

const DateInput = ({ onChange, value, ...props }) => {
    const date = value ? formatDate(new Date(value)) : '';

    const handleChange = e => {
        const { name, value: updatedDate } = e.target;

        const newEventObject = {
            target: {
                value: new Date(updatedDate).toISOString(),
                name
            }
        };

        onChange(newEventObject);
    }

    return <input
        className="form-control"
        type="date"
        value={date}
        onChange={handleChange}
        autoFocus
        {...props}
    />
}

export default DateInput;
