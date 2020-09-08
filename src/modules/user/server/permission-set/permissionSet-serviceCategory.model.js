const path = require('path');
const { DataTypes } = require('sequelize');
const ServiceCategory = require('../permission/service-category.model');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

const PermissionSet_ServiceCategory = sequelize.cdpConnector.define('permissionSets_serviceCategories', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    permissionSetId: {
        allowNull: false,
        type: DataTypes.UUID
    },
    serviceCategoryId  : {
        allowNull: false,
        type: DataTypes.UUID
    },
    action  : {
        type: DataTypes.ENUM,
        values: ['include', 'exclude'],
        defaultValue: 'include'
    }
}, {
    schema: 'ciam',
    tableName: 'permissionSets_serviceCategories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

PermissionSet_ServiceCategory.belongsTo(ServiceCategory, {as: 'serviceCategory', foreignKey: 'serviceCategoryId'});

module.exports = PermissionSet_ServiceCategory;
