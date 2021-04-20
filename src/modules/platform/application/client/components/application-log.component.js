import React, { useEffect, useState } from 'react';
import axios from 'axios';
import fileDownload from 'js-file-download';

const ApplicationLog = (props) => {
    const { id } = props;
    const [applicationLog, setApplicationLog] = useState([]);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [totalLogCount, setTotalLogCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const limit = 1;

    const showDateTime = (date) => {
        var today = new Date(date);
        var date = today.getDate()+'.'+(today.getMonth()+1)+'.'+today.getFullYear();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+' '+time;
        return dateTime;
    }

    const getLogText = (log) => {
        const { event_type, table_name, event_time } = log;
        if (event_type === 'CREATE') {
            return `Created a record in the table ${table_name}.`;
        }
        if (event_type === 'DELETE') {
            return `Deleted a record in the table ${table_name}.`;
        }
        if (event_type === 'UPDATE') {
            return `Updated a record in the table ${table_name}.`;
        }
        if (event_type === 'LOGIN') {
            return `Logged in to the system.`;
        }
        if (event_type === 'LOGOUT') {
            return `Logged out of the system.`;
        }
        if (event_type === 'UNAUTHORIZE') {
            return `Made unauthorized request.`;
        }
        if (event_type === 'BAD_REQUEST') {
            return `Made a bad request.`;
        }
    }

    const getApplicationLog = async function() {
        const queryObject = new URLSearchParams('');

        queryObject.append('page', currentPage);
        currentEvent && queryObject.append('event_type', currentEvent);

        const queryString = queryObject.toString();

        const { data } = await axios.get(`/api/applications/${id}/log${queryString ? '?' + queryString : ''}`);
        setApplicationLog(data.data);
        setTotalLogCount(data.metadata.count);
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
    }, [currentEvent, currentPage]);

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
                    return <div key={log.id}>
                        <span className="font-weight-bold">{showDateTime(log.event_time)}: </span>
                        {getLogText(log)}
                    </div>
                })
                : <div>No log found.</div>
        }
        {((currentPage === 1 &&
            totalLogCount > limit) ||
            (currentPage > 1))
            && applicationLog.length &&
            <div className="pagination justify-content-end align-items-center border-top p-3">
                <span className="cdp-text-primary font-weight-bold">{(currentPage-1) * limit + ' - ' + currentPage * limit}</span> <span className="text-muted pl-1 pr-2"> {' of ' + totalLogCount}</span>
                <span className="pagination-btn" onClick={() => setCurrentPage(currentPage-1)} disabled={currentPage <= 1}><i className="icon icon-arrow-down ml-2 prev"></i></span>
                <span className="pagination-btn" onClick={() => setCurrentPage(currentPage+1)} disabled={currentPage * limit === totalLogCount}><i className="icon icon-arrow-down ml-2 next"></i></span>
            </div>
        }
    </div>
}

export default ApplicationLog;
