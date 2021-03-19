import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ApplicationLog = (props) => {
    const { id } = props;
    const [applicationLog, setApplicationLog] = useState([]);
    const [currentEvent, setCurrentEvent] = useState(null);

    const getLogText = (log) => {
        const { event_type, table_name, event_time } = log;
        if (event_type === 'CREATE') {
            return `Created a record in the table ${table_name} at ${event_time}`;
        }
        if (event_type === 'DELETE') {
            return `Deleted a record in the table ${table_name} at ${event_time}`;
        }
        if (event_type === 'UPDATED') {
            return `Updated a record in the table ${table_name} at ${event_time}`;
        }
        if (event_type === 'LOGIN') {
            return `Logged in to the system at ${event_time}`;
        }
        if (event_type === 'LOGOUT') {
            return `Logged out of the system at ${event_time}`;
        }
        if (event_type === 'UNAUTHORIZE') {
            return `Made unauthorized request at ${event_time}`;
        }
        if (event_type === 'BAD_REQUEST') {
            return `Made a bad request at ${event_time}`;
        }
    }

    const getApplicationLog = async function() {
        const queryObject = new URLSearchParams('');

        currentEvent && queryObject.append('event_type', currentEvent);

        const queryString = queryObject.toString();

        const { data } = await axios.get(`/api/applications/${id}/log${queryString ? '?' + queryString : ''}`);
        setApplicationLog(data);
    }

    useEffect(() => {
        getApplicationLog();
    }, [currentEvent]);

    console.log(applicationLog);

    return <div>
        <select onChange={(e) => setCurrentEvent(e.target.value)}>
            <option value="">SELECT</option>
            <option value="CREATE">CREATE</option>
            <option value="DELETE">DELETE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGIN">LOGOUT</option>
            <option value="LOGIN">UNAUTHORIZE</option>
            <option value="LOGIN">BAD_REQUEST</option>
        </select>
        {
            applicationLog.map(log => {
                return <div>{getLogText(log)}</div>
            })
        }
    </div>
}

export default ApplicationLog;
