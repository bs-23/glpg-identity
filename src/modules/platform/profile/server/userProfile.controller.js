const path = require('path');
const { Op } = require('sequelize');
const Profile = require('./user-profile.model');
const UserProfilePermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/userProfile-permissionSet.model.js"));
const PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permission-set.model.js"));
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));

async function getProfiles(req, res) {
    try {
        const profiles = await Profile.findAll({
            include: [{
                model: UserProfilePermissionSet,
                as: 'up_ps',
                attributes: ['permissionset_id'],
                include: [{
                    model: PermissionSet,
                    as: 'ps',
                    attributes: ['title']
                }]
            }],
            attributes: ['id', 'title', 'slug', 'description', 'type'],
            order: [
                ['created_at', 'ASC']
            ],
        });

        res.json(profiles);
    } catch (error) {
        logger.error(error);
        res.status(500).send('Internal server error');
    }
}

async function createProfile(req, res) {
    const { title, description, permissionSets } = req.body;

    try {
        if(!title.trim()) return res.status(400).send('Profile title must not be empty.');
        if(!Array.isArray(permissionSets)) return res.status(400).send('Invalid format for permission sets.');

        const [profile, created] = await Profile.findOrCreate({
            where: { title },
            defaults: {
                title: title.trim(),
                slug: title.trim().replace(/ +/g, '_').toLowerCase(),
                description: (description || '').trim(),
                created_by: req.user.id,
                updated_by: req.user.id
            }
        });

        if(!created) return res.status(400).send('Profile name already exists.');

        const permission_sets = permissionSets.map(id => ({ user_profile_id: profile.id, permissionset_id: id }));

        await UserProfilePermissionSet.bulkCreate(permission_sets);

        res.json(profile);
    } catch (error) {
        logger.error(error);
        res.status(500).send('Internal server error');
    }
}

async function editProfile(req, res) {
    const { title, description, permissionSets } = req.body;
    const id = req.params.id;

    try {
        if(!title.trim()) return res.status(400).send('Profile title must not be empty.');
        if(!Array.isArray(permissionSets)) return res.status(400).send('Invalid format for permission sets.');

        const foundProfile = await Profile.findOne({ where: { id } });

        if(!foundProfile) return res.status(400).send('Profile not found.');

        const profileWithSameName = await Profile.findOne({ where: { title, id: { [Op.ne]: id } }});

        if(profileWithSameName) return res.status(400).send('Profile with the same title already exists.');

        await foundProfile.update({
            title: title.trim(),
            slug: title.trim().replace(/ /g, '_').toLowerCase(),
            description: (description || '').trim(),
            updated_by: req.user.id
        });

        await foundProfile.setPermission_sets(permissionSets);

        res.json(foundProfile);
    } catch (error) {
        logger.error(error);
        res.status(500).send('Internal server error');
    }
}

exports.getProfiles = getProfiles;
exports.createProfile = createProfile;
exports.editProfile = editProfile;
