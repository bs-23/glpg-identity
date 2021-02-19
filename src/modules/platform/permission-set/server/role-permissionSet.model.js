const path = require('path');
const { DataTypes } = require('sequelize');
const PermissionSet = require('./permission-set.model');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const Role_PermissionSet = sequelize.cdpConnector.define('role_permissionSets', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    permissionset_id: {
        allowNull: false,
        type: DataTypes.UUID
    },
    role_id  : {
        allowNull: false,
        type: DataTypes.UUID
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'role_permissionSets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

Role_PermissionSet.belongsTo(PermissionSet, {as: 'ps', foreignKey: 'permissionset_id'});
PermissionSet.hasMany(Role_PermissionSet, {as: 'ps_role_ps', foreignKey: 'permissionset_id'});

module.exports = Role_PermissionSet;
