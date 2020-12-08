const path = require('path');
const axios = require('axios');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const searchUrl = nodecache.getValue('OKLA_SEARCH_URL');
const auth = {
    username: nodecache.getValue('OKLA_USERNAME'),
    password: nodecache.getValue('OLA_PASSWORD')
};

async function search(queryObj) {
    const { data } = await axios.post(searchUrl, queryObj, { auth });
    return data;
}

exports.search = search;
