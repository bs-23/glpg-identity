const path = require('path');
const PermissionSet = require('./permission-set.model');
const PermissionSet_ServiceCategory = require('./permissionSet-serviceCategory.model');
const ServiceCategory = require('../permission/service-category.model');
const Application = require('../../../application/server/application.model');
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));

async function getPermissionSets(req, res) {
    try {
        const permissionSets = await PermissionSet.findAll({
            include: [{
                model: PermissionSet_ServiceCategory,
                as: 'permissionSet_serviceCategory',
                attributes: [ 'id'],
                include: [{
                    model: ServiceCategory,
                    as: 'serviceCategory',
                    attributes: [ 'id', 'title', 'slug' ]

                }]
            },
            {
                model: Application,
                as: 'application',
                attributes: [ 'id', 'name', 'slug' ]
            }
            ],
            attributes: { exclude: ['created_by', 'updated_by','created_at', 'updated_at', 'applicationId'] },

            order: [
                ['created_at', 'ASC'],
                ['id', 'ASC']
            ]
        });
        res.json(permissionSets);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
}

async function createPermissionSet(req, res) {
    try {
        const {
            title,
            countries,
            application_id,
        } = req.body;

        if(!title.trim()) return res.status(400).send('Permission set title can not be empty.');

        const [doc, created] = await PermissionSet.findOrCreate({
            where: { title },
            defaults: {
                title: title,
                countries: countries,
                applicationId: application_id,
                created_by: req.user.id,
                updated_by: req.user.id
            }
        });

        if(!created) return res.status(400).send('Permission set with the same title already exists.');

        req.body.serviceCategories && req.body.serviceCategories.forEach(async function (serviceCategoryId) {
            await PermissionSet_ServiceCategory.create({
                permissionSetId: doc.id,
                serviceCategoryId: serviceCategoryId
            });
        });

        await logService.log({
            event_type: 'CREATE',
            object_id: doc.id,
            table_name: 'permissionSet',
            created_by: req.user.id,
            description: `${doc.name} permission set created`
        });

        res.json(doc);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
}

async function editPermissionSet(req, res) {
    const { title, countries, application_id, serviceCategories } = req.body;

    try {
        const doc = await PermissionSet.findOne({
            where: { id: req.params.id },
            include: [{
                model: PermissionSet_ServiceCategory,
                as: 'permissionSet_serviceCategory'
            }]
        });

        if (!doc) {
            return res.sendStatus(400);
        }

        await doc.update({
            title: title,
            countries: countries,
            applicationId: applicationId,
            updated_by: req.user.id
        });

        doc.permissionSet_serviceCategory.forEach(async sc => {
            await sc.destroy();

        });

        serviceCategories && serviceCategories.forEach(async function (serviceCategoryId) {
            await PermissionSet_ServiceCategory.create({
                permissionSetId: doc.id,
                serviceCategoryId: serviceCategoryId
            });
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

