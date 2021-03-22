import React, { useEffect, useState } from 'react';
import axios from 'axios';
import fileDownload from 'js-file-download';

const ApplicationLog = (props) => {
    const { id } = props;
    const [applicationLog, setApplicationLog] = useState([]);
    const [currentEvent, setCurrentEvent] = useState(null);

    const showDateTime = (date) => {
        var today = new Date(date);
        var date = today.getDate()+'.'+(today.getMonth()+1)+'.'+today.getFullYear();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+' at '+time;
        return dateTime;
    }

    const getLogText = (log) => {
        const { event_type, table_name, event_time } = log;
        if (event_type === 'CREATE') {
            return `Created a record in the table ${table_name} at ${showDateTime(event_time)}`;
        }
        if (event_type === 'DELETE') {
            return `Deleted a record in the table ${table_name} at ${showDateTime(event_time)}`;
        }
        if (event_type === 'UPDATED') {
            return `Updated a record in the table ${table_name} at ${showDateTime(event_time)}`;
        }
        if (event_type === 'LOGIN') {
            return `Logged in to the system at ${showDateTime(event_time)}`;
        }
        if (event_type === 'LOGOUT') {
            return `Logged out of the system at ${showDateTime(event_time)}`;
        }
        if (event_type === 'UNAUTHORIZE') {
            return `Made unauthorized request at ${showDateTime(event_time)}`;
        }
        if (event_type === 'BAD_REQUEST') {
            return `Made a bad request at ${showDateTime(event_time)}`;
        }
    }

    const getApplicationLog = async function() {
        const queryObject = new URLSearchParams('');

        currentEvent && queryObject.append('event_type', currentEvent);

        const queryString = queryObject.toString();

        const { data } = await axios.get(`/api/applications/${id}/log${queryString ? '?' + queryString : ''}`);
        setApplicationLog(data);
    }

    const onApplicationExport = () => {
        const queryObject = new URLSearchParams('');
        currentEvent && queryObject.append('event_type', currentEvent);
        const queryString = queryObject.toString();

        axios.get(`/api/applications/${id}/export${queryString ? '?' + queryString : ''}`, {
            responseType: 'blob',
        }).then(res => {
            const pad2 = (n) => (n < 10 ? '0' + n : n);
            console.log(res)
            var date = new Date();
            const timestamp = date.getFullYear().toString() + pad2(date.getMonth() + 1) + pad2(date.getDate()) + pad2(date.getHours()) + pad2(date.getMinutes()) + pad2(date.getSeconds());

            fileDownload(res.data, `application_log_${timestamp}.xlsx`);
        }).catch(error => {
            /**
             * the error response is a blob because of the responseType option.
             * text() converts it back to string
             */
            error.response.data.text().then(text => {
                addToast(text, {
                    appearance: 'warning',
                    autoDismiss: true
                });
            });
        });
    }

    useEffect(() => {
        getApplicationLog();
    }, [currentEvent]);

    return <div>
        <select onChange={(e) => setCurrentEvent(e.target.value)}>
            <option value="">All Events</option>
            <option value="CREATE">CREATE</option>
            <option value="DELETE">DELETE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="UNAUTHORIZE">UNAUTHORIZE</option>
            <option value="BAD_REQUEST">BAD_REQUEST</option>
        </select>
        <button onClick={onApplicationExport}>Export</button>
        {
            applicationLog.length
                ? applicationLog.map(log => {
                    return <div key={log.id}>{getLogText(log)}</div>
                })
                : <div>No log found.</div>
        }
    </div>
}

export default ApplicationLog;
