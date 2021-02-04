const path = require('path');
const { DataTypes } = require('sequelize');
const Service = require('../../user/server/permission/service.model');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const PermissionSet_Service = sequelize.cdpConnector.define('permissionSets_services', {
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
    service_id: {
        allowNull: false,
        type: DataTypes.UUID
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'permissionSets_services',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

PermissionSet_Service.belongsTo(Service, {as: 'service', foreignKey: 'service_id'});

module.exports = PermissionSet_Service;
