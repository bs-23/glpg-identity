const path = require('path');
const { DataTypes } = require('sequelize');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const UserProfile_PermissionSet = require('./permission-set/userProfile-permissionSet.model');

const Role = sequelize.cdpConnector.define('user_profiles', {
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
    tableName: 'user_profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

UserProfile.hasMany(UserProfile_PermissionSet, {as: 'userProfile_permissionSet', foreignKey: 'userProfileId', sourceKey: 'id'});

module.exports = UserProfile;
