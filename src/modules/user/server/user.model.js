const path = require('path');
const bcrypt = require('bcryptjs');
const { DataTypes } = require('sequelize');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

const User = sequelize.define('user', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        validate: {
            isUUID: 4
        }
    },
    client_id: {
        type: DataTypes.UUID,
        validate: {
            customValidator(value) {
                if (value === null && this.type !== 'admin') {
                    throw new Error("client_id is required for basic user");
                }
            }
        }
    },
    name: {
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
    countries: {
        type: DataTypes.ARRAY(DataTypes.STRING)
    },
    permissions: {
        type: DataTypes.ARRAY(DataTypes.STRING)
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
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

User.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = User;
