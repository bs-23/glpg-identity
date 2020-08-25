const path = require('path');
const { DataTypes } = require('sequelize');
const PermissionSet = require('./permission-set.model');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

const UserProfile_PermissionSet = sequelize.cdpConnector.define('userProfiles_permissionSets', {
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
    userProfileId  : {
        allowNull: false,
        type: DataTypes.UUID
    }
}, {
    schema: 'ciam',
    tableName: 'userProfiles_permissionSets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

UserProfile_PermissionSet.belongsTo(PermissionSet, {as: 'permissionSet', foreignKey: 'permissionSetId'});

module.exports = UserProfile_PermissionSet;
