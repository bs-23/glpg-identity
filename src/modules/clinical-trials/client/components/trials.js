import React, {useState } from 'react';
import axios from 'axios';
import StoryForm from './clinical-trials-story-form.component';

var dumpData =  function() {
    const url = `/api/clinical-trials`;
    var urlToGetData = prompt("urlToGetData:", "https://clinicaltrials.gov/api/query/full_studies?expr=AREA%5BInterventionName%5DFilgotinib+AND+AREA%5BLeadSponsorName%5Dgilead%0D%0A&min_rnk=1&max_rnk=100&fmt=json");
    return {
        payload: axios({
            method: 'post',
            url,
            data: {
                "urlToGetData": urlToGetData,
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


const ClinicalTrials = () => {
    const [show, setShow] = useState(false);
    const [addMode, setAddMode] = useState(false);
    const addDataSample = {
        title: 'Sample Title',
        trials : [1,2,3],
        version: 'v1',
        story: 'sample story',
        story_plaintext: 'sample story plain text'
    }
    return (
        <div>
            <button onClick={dumpData}>Dump Data</button>
            <button onClick={showAllVersions}>Show All Versions</button>
            <button onClick={mergeProcessData}>Merge</button>
            <button onClick={()=>{setShow(true); setAddMode(true);}}>Add Story</button>
            
    
            {show ? <StoryForm addMode={addMode} changeShow={(val) => setShow(val)} show={show} trialIDs={[1,2,3]} addData = {addDataSample} /> : null}
        </div>
    );
}

export default ClinicalTrials;
