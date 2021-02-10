const path = require('path');
const bcrypt = require('bcryptjs');
const { DataTypes } = require('sequelize');
const Sequelize = require('sequelize');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const UserProfile = require(path.join(process.cwd(), 'src/modules/platform/profile/server/user-profile.model.js'));
// const User_Role = require(path.join(process.cwd(), 'src/modules/platform/role/server/user-role.model.js'));
const Role = require(path.join(process.cwd(), 'src/modules/platform/role/server/role.model.js'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const User = sequelize.cdpConnector.define('users', {
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
    role_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    first_name: {
        allowNull: false,
        type: DataTypes.STRING(50)
    },
    last_name: {
        allowNull: false,
        type: DataTypes.STRING(50)
    },
    email: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING(100),
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
        type: DataTypes.STRING(25)
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
    password_expiry_date: {
        type: DataTypes.DATE
    },
    password_updated_at: {
        type: Sequelize.DATE
    },
    refresh_token: {
        type: DataTypes.STRING
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
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

User.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

User.belongsTo(User, { as: 'createdByUser', foreignKey: 'created_by' });
User.belongsTo(UserProfile, { as: 'userProfile', foreignKey: 'profileId' });
User.belongsTo(Role, { as: 'userRole', foreignKey: 'role_id' });
// User.hasMany(User_Role, {as: 'userRoles', foreignKey: 'userId', sourceKey: 'id'});

module.exports = User;
