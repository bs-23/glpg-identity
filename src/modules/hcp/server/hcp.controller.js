const path = require('path');
const jwt = require('jsonwebtoken');
const Hcp = require('./hcp.model');

async function getHcpUserList(req, res) {
    try {
        const hcpUsers = await Hcp.findAll({
            attributes: { exclude: ['password'] }
        });
        return res.json(hcpUsers);
    } catch (error) {
        return res.status(500).send('Internal server error');
    }
}

async function changeHcpUserStatus(req, res) {
    const {
        email,
        is_active
    } = req.body;

    if (is_active === undefined) return res.status(404).send('status not defined');

    try {
        const hcpUser = await Hcp.findOne({
            where: {
                email
            },
            attributes: ['id', 'name', 'email', 'phone', 'is_active'],
        });

        if (!hcpUser) return res.status(404).send('Account is already deleted or not found');

        hcpUser.update({ is_active });

        return res.status(200).json(hcpUser);
    }
    catch (err) {
        return res.status(500).send('Internal server error');
    }
}

async function editHcpProfile(req, res) {
    const {
        name,
        email,
        phone,
        is_active
    } = req.body;

    try {
        const hcpUser = await Hcp.findOne({
            where: {
                email
            },
            attributes: ['id', 'name', 'email', 'phone', 'is_active'],
        });

        if (!hcpUser) return res.status(404).send('Account is already deleted or not found');

        hcpUser.update({ is_active, name, phone });

        return res.status(200).json(hcpUser);
    }
    catch (err) {
        return res.status(500).send('Internal server error');
    }
}


exports.getHcpUserList = getHcpUserList;
exports.changeHcpUserStatus = changeHcpUserStatus;
exports.editHcpProfile = editHcpProfile;