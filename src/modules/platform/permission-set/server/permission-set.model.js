const path = require('path');
const { DataTypes } = require('sequelize');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const Application = require(path.join(process.cwd(), 'src/modules/platform/application/server/application.model'));
const PermissionSet_Service = require('./permissionset-service.model');
const PermissionSet_Application = require('./permissionSet-application.model');
const Service = require('../../user/server/permission/service.model');
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
PermissionSet.hasMany(PermissionSet_Application, {as: 'ps_app', foreignKey: 'permissionSetId', sourceKey: 'id'});
PermissionSet.belongsToMany(Application, { through: PermissionSet_Application });

PermissionSet.hasMany(PermissionSet_Service, {as: 'ps_sc', foreignKey: 'permissionset_id', sourceKey: 'id'});
PermissionSet.belongsToMany(Service, { through: PermissionSet_Service, foreignKey: 'permissionset_id', otherKey: 'service_id' });
PermissionSet_Service.belongsTo(PermissionSet, {as: 'permission_set', foreignKey: 'permissionset_id' });

module.exports = PermissionSet;
