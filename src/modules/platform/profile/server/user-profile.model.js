const path = require('path');
const { DataTypes } = require('sequelize');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const UserProfile_PermissionSet = require('../../permission-set/server/userProfile-permissionSet.model');
const PermissionSet = require('../../permission-set/server/permission-set.model');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const UserProfile = sequelize.cdpConnector.define('user_profiles', {
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
    type: {
        type: DataTypes.ENUM,
        values: ['standard', 'custom'],
        defaultValue: "custom"
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
    tableName: 'user_profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

UserProfile.hasMany(UserProfile_PermissionSet, {as: 'up_ps', foreignKey: 'userProfileId', sourceKey: 'id'});
UserProfile.belongsToMany(PermissionSet, { through: UserProfile_PermissionSet });
UserProfile_PermissionSet.belongsTo(UserProfile, {as: 'profile', foreignKey: 'userProfileId', sourceKey: 'id'});

module.exports = UserProfile;
