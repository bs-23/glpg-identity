const path = require('path');
const { DataTypes } = require('sequelize');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const RolePermission = require('./role-permission.model');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const Role = sequelize.cdpConnector.define('roles', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    name: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING
    },
    slug: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.STRING
    },
    created_by: {
        type: DataTypes.UUID
    },
    updated_by: {
        type: DataTypes.UUID
    },
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'roles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

Role.hasMany(RolePermission, {as: 'rolePermission', foreignKey: 'roleId', sourceKey: 'id'});

module.exports = Role;
