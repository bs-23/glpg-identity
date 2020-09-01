const path = require('path');
const Profile = require('./user-profile.model');

async function getProfiles(req, res) {
    try {
        const profiles = await Profile.findAll();
        res.json(profiles);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
}

exports.getProfiles = getProfiles;
