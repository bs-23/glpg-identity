const path = require('path');
const bcrypt = require('bcryptjs');
const { DataTypes } = require('sequelize');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const UserProfile = require('./user-profile.model');
const User_PermissionSet = require('./permission-set/user-permissionSet.model');

const User = sequelize.cdpConnector.define('users_new', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        validate: {
            isUUID: 4
        }
    },
    profileId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    first_name: {
        allowNull: false,
        type: DataTypes.STRING
    },
    last_name: {
        allowNull: false,
        type: DataTypes.STRING
    },
    email: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        set(value) {
            this.setDataValue('password', bcrypt.hashSync(value, 8));
        }
    },
    phone: {
        type: DataTypes.STRING
    },
    type: {
        type: DataTypes.ENUM,
        values: ['admin', 'basic'],
        defaultValue: 'basic'
    },
    status: {
        type: DataTypes.ENUM,
        values: ['active', 'inactive'],
        defaultValue: 'active'
    },
    failed_auth_attempt: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_login: {
        type: DataTypes.DATE
    },
    expiry_date: {
        type: DataTypes.DATE
    },
    created_by: {
        type: DataTypes.UUID,
        validate: {
            customValidator(value) {
                if (value === null && this.type !== 'admin') {
                    throw new Error("created_by is required for basic user");
                }
            }
        }
    },
    updated_by: {
        type: DataTypes.UUID,
        validate: {
            customValidator(value) {
                if (value === null && this.type !== 'admin') {
                    throw new Error("updated_by is required for basic user");
                }
            }
        }
    },
}, {
    schema: 'ciam',
    tableName: 'users_new',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

User.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

User.belongsTo(User, { as: 'createdByUser', foreignKey: 'created_by' });
User.belongsTo(UserProfile, { as: 'userProfile', foreignKey: 'profileId' });
User.hasMany(User_PermissionSet, {as: 'user_permissionSet', foreignKey: 'userId', sourceKey: 'id'});


module.exports = User;
