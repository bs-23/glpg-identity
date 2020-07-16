const path = require('path');
const { DataTypes } = require('sequelize');
const Permission = require('./permission/permission.model');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

const UserPermission = sequelize.cdpConnector.define('user-permissions', {
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
    userId: {
        allowNull: false,
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
    tableName: 'user-permissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

UserPermission.belongsTo(Permission, {as: 'permission', foreignKey: 'permissionId'});

module.exports = UserPermission;
