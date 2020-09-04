const path = require('path');
const { Op, QueryTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const PermissionSet = require('./permission-set.model');
const PermissionSet_ServiceCategory = require('./permissionSet-serviceCategory.model');
const ServiceCategory = require('../permission/service-category.model');
const Application = require('../../../application/server/application.model');
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));

const allCountries = async () => {
    const countries = await sequelize.datasyncConnector.query(`SELECT * FROM ciam.vwcountry`, { type: QueryTypes.SELECT });
    return countries;
}

const allServiceCategories = async () => {
    const serviceCategories = await ServiceCategory.findAll();
    return serviceCategories.map(i => i.dataValues);
}

const allApplications = async () => {
    const applications = await Application.findAll();
    return applications.map(i => i.dataValues);
}

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
                ['created_at', 'ASC']
            ]
        });

        const permissionSetList = await Promise.all(
            permissionSets.map(async item => {
                if(item.dataValues.slug === 'system_admin'){
                    const countries = await allCountries();
                    const applications = await allApplications();
                    const serviceCategories = await allServiceCategories();
                    item.dataValues.countries = countries.map(c => c.country_iso2);
                    item.dataValues.application = { name: applications && applications.map(app => app.name).join(', ') };
                    item.dataValues.permissionSet_serviceCategory = serviceCategories && serviceCategories.map(sc => ({ serviceCategory: { id: sc.id, title: sc.title, slug: sc.slug } }));
                }
                return item.dataValues;
            })
        )

        res.json(permissionSetList);
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
                slug: title.replace(/ /g, '_').toLowerCase(),
                countries: countries,
                applicationId: application_id || null,
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
        if(!title.trim()) return res.status(400).send('Permission set title can not be empty.');

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

        const permSetWithSameTitle = await PermissionSet.findAll({ where: { id: { [Op.ne]: doc.id }, title }});

        if(permSetWithSameTitle.length) return res.status(400).send('Permission set with the same title already exists.');

        await doc.update({
            title: title.trim(),
            slug: title.trim().replace(/ /g, '_').toLowerCase(),
            countries: countries,
            applicationId: application_id ? application_id : null,
            updated_by: req.user.id
        });

        await doc.setService_categories(serviceCategories);

        res.json(doc);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
}


exports.getPermissionSets = getPermissionSets;
exports.createPermissionSet = createPermissionSet;
exports.editPermissionSet = editPermissionSet;

