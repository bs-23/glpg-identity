import React from 'react';
import axios from 'axios';

var dumpData =  function() {
    const url = `/api/clinical-trials`;

    return {
        payload: axios({
            method: 'post',
            url,
            data: {
                "urlToGetData": "https://clinicaltrials.gov/api/query/full_studies?expr=SEARCH%5BStudy%5D%28AREA%5BOrgFullName%5DGalapagos+NV%29&fmt=json&min_rnk=1&max_rnk=100",
                "description": "all data from glpg nv"
              }
        }).then(out=>console.log(out))
    };
}

var showAllVersions =  function() {
    const url = `/api/clinical-trials/versions`;

    return {
        payload: axios({
            method: 'get',
            url
        }).then(out=>console.log(out))
    };
}

var mergeProcessData =  function() {
    const url = `/api/clinical-trials/merge-versions`;

    var ids = prompt("Ids:", "f5dc122a-5a78-4d5a-98af-0708db00c398,d8a43180-2246-46bd-b2ee-7f5e579b2d28");

    return {
        payload: axios({
            method: 'post',
            url,
            data: {
                "ids": ids
              }
        }).then(out=>console.log(out))
    };
}


const ConsentManagement = () => {
    return (
        <div>
            <button onClick={dumpData}>Dump Data</button>
            <button onClick={showAllVersions}>Show All Versions</button>
            <button onClick={mergeProcessData}>Merge</button>
        </div>
    );
}

export default ConsentManagement;
