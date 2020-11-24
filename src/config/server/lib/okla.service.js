const path = require('path');
const axios = require('axios');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const baseUrl = nodecache.getValue('OKLA_BASE_URL');
const cid = nodecache.getValue('OLA_CID');
const auth = {
    username: nodecache.getValue('OKLA_USERNAME'),
    password: nodecache.getValue('OLA_PASSWORD')
};

async function search(queryObj) {
    // const OklaService = require(path.join(process.cwd(), 'src/config/server/lib/okla.service'));
    // const queryObj = {
    //     entityType: 'activity',
    //     isoCod2: 'FR',
    //     resultSize: 50,
    //     fields: [
    //         {
    //             name: 'individual.lastName',
    //             values: ['harold']
    //         }
    //     ]
    // };
    // const searchResult = await OklaService.search(queryObj);
    // console.log('=============================', JSON.stringify(searchResult, null, 4));

    const { data } = await axios.post(`${baseUrl}/ok/search/${cid}`, queryObj, { auth });
    return data;
}

exports.search = search;
