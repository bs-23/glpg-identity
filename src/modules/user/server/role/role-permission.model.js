const path = require('path');
const { DataTypes } = require('sequelize');
const Permission = require('../permission/permission.model');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const RolePermission = sequelize.cdpConnector.define('role_permissions', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    permissionId: {
        allowNull: false,
        type: DataTypes.UUID
    },
    roleId: {
        allowNull: false,
        type: DataTypes.UUID
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'role_permissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

RolePermission.belongsTo(Permission, {as: 'permission', foreignKey: 'permissionId'});

module.exports = RolePermission;
