const path = require('path');
const bcrypt = require('bcryptjs');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const Application = sequelize.cdpConnector.define('applications', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    name: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING
    },
    slug: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING
    },
    type: {
        type: DataTypes.ENUM,
        values: ['hcp-portal']
    },
    // scope: {
    //     type: DataTypes.ARRAY(DataTypes.STRING)
    // },
    email: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
            isEmail: true
        }
    },
    description: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING,
        set(value) {
            this.setDataValue('password', bcrypt.hashSync(value, 8));
        }
    },
    refresh_token: {
        type: DataTypes.STRING
    },
    auth_secret: {
        allowNull: false,
        type: DataTypes.UUID
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.UUID
    },
    updated_by: {
        type: DataTypes.UUID
    },
    metadata: {
        type: DataTypes.JSON
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'applications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

Application.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = Application;
