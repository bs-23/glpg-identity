const path = require('path');
const { Op } = require('sequelize');
const validator = require('validator');
const PermissionSet = require('./permission-set.model');
const PermissionSet_Service = require('./permissionset-service.model');
const PermissionSet_Application = require('./permissionSet-application.model');
const Service = require('../../user/server/permission/service.model');
const Application = require(path.join(process.cwd(), 'src/modules/platform/application/server/application.model'));
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));
const UserProfile_PermissionSet = require(path.join(process.cwd(), 'src/modules/platform/permission-set/server/userProfile-permissionSet.model.js'));
const UserProfile = require(path.join(process.cwd(), 'src/modules/platform/profile/server/user-profile.model.js'));
const UserRole_PermissionSet = require(path.join(process.cwd(), 'src/modules/platform/permission-set/server/role-permissionSet.model.js'));
const Role = require(path.join(process.cwd(), 'src/modules/platform/role/server/role.model.js'));

async function getPermissionSets(req, res) {
    try {
        const permissionSets = await PermissionSet.findAll({
            include: [{
                model: PermissionSet_Service,
                as: 'ps_sc',
                attributes: [ 'id'],
                include: [{
                    model: Service,
                    as: 'service',
                    attributes: [ 'id', 'title', 'slug' ]

                }]
            },
            {
                model: PermissionSet_Application,
                as: 'ps_app',
                attributes: [ 'id'],
                include: [{
                    model: Application,
                    as: 'application',
                    attributes: [ 'id', 'name', 'slug' ]

                }]
            }
            ],
            attributes: { exclude: ['created_by', 'updated_by','created_at', 'updated_at'] },

            order: [
                ['created_at', 'ASC']
            ]
        });


        res.json(permissionSets);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
}

async function getPermissionSet(req, res) {
    const id = req.params.id;

    try {
        if(!id || !validator.isUUID(id)) return res.status(400).send('Invalid parameter.');

        const permissionSet = await PermissionSet.findOne({
            where: { id },
            include: [
                {
                    model: PermissionSet_Service,
                    as: 'ps_sc',
                    attributes: [ 'id'],
                    include: [{
                        model: Service,
                        as: 'service',
                        attributes: [ 'id', 'title', 'slug' ]

                    }]
                },
                {
                    model: PermissionSet_Application,
                    as: 'ps_app',
                    attributes: [ 'id'],
                    include: [{
                        model: Application,
                        as: 'application',
                        attributes: [ 'id', 'name', 'slug' ]

                    }]
                },
                {
                    model: UserProfile_PermissionSet,
                    as: 'ps_up_ps',
                    include: [{
                        model: UserProfile,
                        as: 'profile'
                    }]
                },
                {
                    model: UserRole_PermissionSet,
                    as: 'ps_role_ps',
                    include: [{
                        model: Role,
                        as: 'role'
                    }]
                }
            ],
            attributes: { exclude: ['created_by', 'updated_by','created_at', 'updated_at'] }
        });

        if(!permissionSet) return res.status(404).send('Permission set not found.');

        res.json(permissionSet.dataValues);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
}

async function createPermissionSet(req, res) {
    try {
        const {
            title,
            description,
            countries,
            serviceCategories,
            applications
        } = req.body;

        if(!title.trim()) return res.status(400).send('Permission set title can not be empty.');

        const [doc, created] = await PermissionSet.findOrCreate({
            where: { title: { [Op.iLike]: title.trim() } },
            defaults: {
                title: title.trim(),
                slug: title.replace(/ +/g, '_').toLowerCase(),
                description: (description || '').trim(),
                countries: countries ? countries : [],
                created_by: req.user.id,
                updated_by: req.user.id
            }
        });

        if(!created) return res.status(400).send('Permission set with the same title already exists.');


        let serviceCategories_permissionSet = [];

        serviceCategories_permissionSet = serviceCategories.map(id => ({ permissionset_id: doc.id, service_id: id }));


        await PermissionSet_Service.bulkCreate(serviceCategories_permissionSet);

        let applications_permissionSet = [];

        applications_permissionSet = applications.map(id => ({ permissionSetId: doc.id, applicationId: id }));


        await PermissionSet_Application.bulkCreate(applications_permissionSet);

        await logService.log({
            event_type: 'CREATE',
            object_id: doc.id,
            table_name: 'permission_sets',
            actor: req.user.id,
            remarks: `"${doc.title}" Permission-Set created`
        });

        res.json(doc);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
}

async function editPermissionSet(req, res) {
    const { title, description, countries, serviceCategories, applications } = req.body;

    try {
        if(!title.trim()) return res.status(400).send('Permission set title can not be empty.');

        const doc = await PermissionSet.findOne({
            where: { id: req.params.id },
            include: [{
                model: PermissionSet_Service,
                as: 'ps_sc'
            }]
        });

        if (!doc) {
            return res.sendStatus(400);
        }

        const permSetWithSameTitle = await PermissionSet.findAll({ where: { id: { [Op.ne]: doc.id }, title: { [Op.iLike]: title.trim() } }});

        if(permSetWithSameTitle.length) return res.status(400).send('Permission set with the same title already exists.');

        await doc.update({
            title: title.trim(),
            slug: title.trim().replace(/ /g, '_').toLowerCase(),
            countries: countries ? countries : [],
            description: (description || '').trim(),
            updated_by: req.user.id
        });

        await doc.setServices(serviceCategories);

        await doc.setApplications(applications);

        await logService.log({
            event_type: 'UPDATE',
            object_id: doc.id,
            table_name: 'permission_sets',
            actor: req.user.id,
            remarks: `Permission-Set updated`
        });

        res.json(doc);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
}


exports.getPermissionSets = getPermissionSets;
exports.createPermissionSet = createPermissionSet;
exports.editPermissionSet = editPermissionSet;
exports.getPermissionSet = getPermissionSet;

