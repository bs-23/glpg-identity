const path = require('path');
const { DataTypes } = require('sequelize');
const Application = require(path.join(process.cwd(), 'src/modules/platform/application/server/application.model'));

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const PermissionSet_Application = sequelize.cdpConnector.define('permissionSets_applications', {
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
    applicationId  : {
        allowNull: false,
        type: DataTypes.UUID
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'permissionSets_applications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

PermissionSet_Application.belongsTo(Application, {as: 'application', foreignKey: 'applicationId'});

module.exports = PermissionSet_Application;
