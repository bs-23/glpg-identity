const path = require('path');
const Profile = require('./user-profile.model');
const UserProfilePermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/userProfile-permissionSet.model"));
const PermissionSet = require(path.join(process.cwd(), "src/modules/user/server/permission-set/permission-set.model"));

async function getProfiles(req, res) {
    try {
        const profiles = await Profile.findAll({
            include: [{
                model: UserProfilePermissionSet,
                as: 'userProfile_permissionSet',
                attributes: ['permissionSetId'],
                include: [{
                    model: PermissionSet,
                    as: 'permissionSet',
                    attributes: ['title']
                }]
            }],
            attributes: ['id', 'title', 'slug']
        });

        res.json(profiles);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
}

async function createProfile(req, res) {
    const { title, permissionSets } = req.body;

    try {
        if(!title.trim()) return res.status(400).send('Profile title must not be empty.');
        if(!Array.isArray(permissionSets)) return res.status(400).send('Invalid format for permission sets.');
        if(!permissionSets.length) return res.status(400).send('Must provide permission sets.');

        const [profile, created] = await Profile.findOrCreate({
            where: { title },
            defaults: {
                title,
                slug: title.replace(/ /g, '_').toLowerCase(),
                created_by: req.user.id,
                updated_by: req.user.id
            }
        });

        if(!created) return res.status(400).send('Profile name already exists.');

        const permission_sets = permissionSets.map(id => ({ userProfileId: profile.id, permissionSetId: id }));

        await UserProfilePermissionSet.bulkCreate(permission_sets);

        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
}

exports.getProfiles = getProfiles;
exports.createProfile = createProfile;
