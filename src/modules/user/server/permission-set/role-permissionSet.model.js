const path = require('path');
const { DataTypes } = require('sequelize');
const PermissionSet = require('./permission-set.model');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

const Role_PermissionSet = sequelize.cdpConnector.define('role_permissionSets', {
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
    roleId  : {
        allowNull: false,
        type: DataTypes.UUID
    }
}, {
    schema: 'ciam',
    tableName: 'role_permissionSets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

Role_PermissionSet.belongsTo(PermissionSet, {as: 'permissionSet', foreignKey: 'permissionSetId'});

module.exports = Role_PermissionSet;
