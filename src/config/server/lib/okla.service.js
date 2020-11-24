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
    const { data } = await axios.post(`${baseUrl}/ok/search/${cid}`, queryObj, { auth });
    return data;
}

exports.search = search;
