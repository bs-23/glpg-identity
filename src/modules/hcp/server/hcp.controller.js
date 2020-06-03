const path = require('path');
const jwt = require('jsonwebtoken');
const Hcp = require('./hcp.model');

async function getHcpUserList(req, res) {
    try {
        const hcpUsers = await Hcp.findAll();
        return res.json(hcpUsers);
    } catch (error) {
        console.log(error);
    }
}


exports.getHcpUserList = getHcpUserList;