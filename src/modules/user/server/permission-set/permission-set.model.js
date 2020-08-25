const path = require('path');
const { DataTypes } = require('sequelize');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const Application = require('../../../application/server/application.model');
const PermissionSet_ServiceCategory = require('./permissionSet-serviceCategory.model');

const PermissionSet = sequelize.cdpConnector.define('permission_sets', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    title: {
        type: DataTypes.STRING
    },
    countries: {
        type: DataTypes.ARRAY(DataTypes.STRING)
    },
    applicationId: {
        allowNull: true,
        type: DataTypes.UUID
    },
    created_by: {
        type: DataTypes.UUID
    },
    updated_by: {
        type: DataTypes.UUID
    },
}, {
    schema: 'ciam',
    tableName: 'permission_sets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

PermissionSet.belongsTo(Application, {as: 'application', foreignKey: 'applicationId'});
PermissionSet.hasMany(PermissionSet_ServiceCategory, {as: 'permissionSet_serviceCategory', foreignKey: 'permissionSetId', sourceKey: 'id'});

module.exports = PermissionSet;
