const path = require('path');
const { Op, QueryTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const validator = require('validator');
const PermissionSet = require('./permission-set.model');
const PermissionSet_ServiceCategory = require('./permissionSet-serviceCategory.model');
const PermissionSet_Application = require('./permissionSet-application.model');
const ServiceCategory = require('../permission/service-category.model');
const Application = require('../../../application/server/application.model');
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));

const allCountries = async () => {
    const countries = await sequelize.datasyncConnector.query(`SELECT * FROM ciam.vwcountry`, { type: QueryTypes.SELECT });
    return countries;
}

const allServiceCategories = async () => {
    const serviceCategories = await ServiceCategory.findAll({ where: { slug: { [Op.ne]: 'all' }} });
    return serviceCategories.map(i => i.dataValues);
}

const allApplications = async () => {
    const applications = await Application.findAll({ where: { slug: { [Op.ne]: 'all' }} });
    return applications.map(i => i.dataValues);
}

async function getPermissionSets(req, res) {
    try {
        const permissionSets = await PermissionSet.findAll({
            include: [{
                model: PermissionSet_ServiceCategory,
                as: 'ps_sc',
                attributes: [ 'id'],
                include: [{
                    model: ServiceCategory,
                    as: 'serviceCategory',
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

        const permissionSetList = await Promise.all(
            permissionSets.map(async ps => {
                if(ps.countries && ps.countries.includes('all')){
                    const countries = await allCountries();
                    ps.dataValues.countries = countries.map(c => c.country_iso2);
                }
                if(ps.ps_sc && ps.ps_sc.find(psc => psc.serviceCategory.slug === 'all')) {
                    const serviceCategories = await allServiceCategories();
                    ps.dataValues.ps_sc = serviceCategories && serviceCategories.map(sc => ({ serviceCategory: { id: sc.id, title: sc.title, slug: sc.slug } }));
                }
                if(ps.ps_app && ps.ps_app.find(papp => papp.application.slug === 'all')) {
                    const applications = await allApplications();
                    ps.dataValues.ps_app = applications && applications.map(app=> ({ application: { id: app.id, name: app.name } }));
                }
                return ps.dataValues;
            })
        )

        res.json(permissionSetList);
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
            include: [{
                    model: PermissionSet_ServiceCategory,
                    as: 'ps_sc',
                    attributes: [ 'id'],
                    include: [{
                        model: ServiceCategory,
                        as: 'serviceCategory',
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
                        attributes: [ 'id', 'name' ]

                    }]
                }
            ],
            attributes: { exclude: ['created_by', 'updated_by','created_at', 'updated_at'] }
        });

        if(!permissionSet) return res.status(404).send('Permission set not found.');

        if(permissionSet.dataValues.slug === 'system_admin'){
            const countries = await allCountries();
            const applications = await allApplications();
            const serviceCategories = await allServiceCategories();
            permissionSet.dataValues.countries = countries.map(c => c.country_iso2);
            permissionSet.dataValues.ps_app = applications && applications.map(app=> ({ application: { id: app.id, name: app.name } }));
            permissionSet.dataValues.ps_sc = serviceCategories && serviceCategories.map(sc => ({ serviceCategory: { id: sc.id, title: sc.title, slug: sc.slug } }));
        }

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
        } = req.body;

        if(!title.trim()) return res.status(400).send('Permission set title can not be empty.');

        const [doc, created] = await PermissionSet.findOrCreate({
            where: { title },
            defaults: {
                title: title,
                slug: title.replace(/ +/g, '_').toLowerCase(),
                description,
                countries: countries,
                created_by: req.user.id,
                updated_by: req.user.id
            }
        });

        if(!created) return res.status(400).send('Permission set with the same title already exists.');

        const serviceCategories_permissionSet = req.body.serviceCategories.map(id => ({ permissionSetId: doc.id, serviceCategoryId: id }));

        await PermissionSet_ServiceCategory.bulkCreate(serviceCategories_permissionSet);

        const applications_permissionSet = req.body.applications.map(id => ({ permissionSetId: doc.id, applicationId: id }));

        await PermissionSet_Application.bulkCreate(applications_permissionSet);

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
    const { title, description, countries, serviceCategories, applications } = req.body;

    try {
        if(!title.trim()) return res.status(400).send('Permission set title can not be empty.');

        const doc = await PermissionSet.findOne({
            where: { id: req.params.id },
            include: [{
                model: PermissionSet_ServiceCategory,
                as: 'ps_sc'
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
            description,
            updated_by: req.user.id
        });

        await doc.setService_categories(serviceCategories);
        await doc.setApplications(applications);

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

