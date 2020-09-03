const path = require('path');
const { DataTypes } = require('sequelize');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const Role_PermissionSet = require('../permission-set/role-permissionSet.model');

const Role = sequelize.cdpConnector.define('roles', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    title: {
        type: DataTypes.STRING
    },
    slug: {
        type: DataTypes.STRING
    },
    created_by: {
        type: DataTypes.UUID
    },
    updated_by: {
        type: DataTypes.UUID
    },
}, {
    schema: 'ciam',
    tableName: 'roles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

Role.hasMany(Role_PermissionSet, {as: 'role_ps', foreignKey: 'roleId', sourceKey: 'id'});

module.exports = Role;
