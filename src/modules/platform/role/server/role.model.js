const path = require('path');
const { DataTypes } = require('sequelize');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const Role_PermissionSet = require(path.join(process.cwd(), 'src/modules/platform/permission-set/server/role-permissionSet.model.js'));
const PermissionSet = require(path.join(process.cwd(), 'src/modules/platform/permission-set/server/permission-set.model.js'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const Role = sequelize.cdpConnector.define('roles', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    title: {
        type: DataTypes.STRING(50)
    },
    slug: {
        type: DataTypes.STRING
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
    tableName: 'roles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

Role.hasMany(Role_PermissionSet, {as: 'role_ps', foreignKey: 'roleId', sourceKey: 'id'});
Role.belongsToMany(PermissionSet, { through: Role_PermissionSet });
Role_PermissionSet.belongsTo(Role, {as: 'role', foreignKey: ''});

module.exports = Role;
