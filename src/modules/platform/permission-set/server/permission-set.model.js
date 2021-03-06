const path = require('path');
const { DataTypes } = require('sequelize');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const Application = require(path.join(process.cwd(), 'src/modules/platform/application/server/application.model'));
const PermissionSet_ServiceCategory = require('./permissionSet-serviceCategory.model');
const PermissionSet_Application = require('./permissionSet-application.model');
const ServiceCategory = require('../../user/server/permission/service-category.model');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const PermissionSet = sequelize.cdpConnector.define('permission_sets', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    slug: {
        type: DataTypes.STRING
    },
    title: {
        type: DataTypes.STRING(50)
    },
    type: {
        type: DataTypes.ENUM,
        values: ['standard', 'custom'],
        defaultValue: "custom"
    },
    countries: {
        type: DataTypes.ARRAY(DataTypes.STRING)
    },
    description: {
        type: DataTypes.STRING(500)
    },
    created_by: {
        type: DataTypes.UUID
    },
    updated_by: {
        type: DataTypes.UUID
    },
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'permission_sets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

PermissionSet.belongsTo(Application, {as: 'application', foreignKey: 'applicationId'});
PermissionSet.hasMany(PermissionSet_ServiceCategory, {as: 'ps_sc', foreignKey: 'permissionSetId', sourceKey: 'id'});
PermissionSet.hasMany(PermissionSet_Application, {as: 'ps_app', foreignKey: 'permissionSetId', sourceKey: 'id'});
PermissionSet.belongsToMany(ServiceCategory, { through: PermissionSet_ServiceCategory });
PermissionSet.belongsToMany(Application, { through: PermissionSet_Application });

module.exports = PermissionSet;
