const path = require('path');
const { DataTypes } = require('sequelize');
const Role = require('./role/role.model');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const UserRole = sequelize.cdpConnector.define('user_roles', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    roleId: {
        allowNull: false,
        type: DataTypes.UUID
    },
    userId: {
        allowNull: false,
        type: DataTypes.UUID
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'user_roles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});


UserRole.belongsTo(Role, {as: 'role', foreignKey: 'roleId'});

module.exports = UserRole;
