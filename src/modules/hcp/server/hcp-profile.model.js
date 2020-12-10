const path = require('path');
const bcrypt = require('bcryptjs');
const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const HcpConsents = require('./hcp-consents.model');

const HcpProfile = sequelize.cdpConnector.define('hcp_profiles', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    application_id: {
        allowNull: false,
        type: DataTypes.UUID
    },
    uuid: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING(20)
    },
    individual_id_onekey: {
        unique: true,
        type: DataTypes.STRING
    },
    salutation: {
        allowNull: false,
        type: DataTypes.STRING(5)
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
        type: DataTypes.STRING(100)
    },
    password: {
        type: DataTypes.STRING,
        set(value) {
            this.setDataValue('password', bcrypt.hashSync(value, 8));
        }
    },
    telephone: {
        allowNull: true,
        type: DataTypes.STRING(25)
    },
    birthdate: {
        type: DataTypes.STRING
    },
    country_iso2: {
        allowNull: false,
        type: DataTypes.STRING(2)
    },
    language_code: {
        allowNull: false,
        type: DataTypes.STRING(2)
    },
    locale: {
        allowNull: false,
        type: DataTypes.STRING(5)
    },
    specialty_onekey: {
        allowNull: false,
        type: DataTypes.STRING(20)
    },
    status: {
        type: DataTypes.ENUM,
        values: ['self_verified', 'manually_verified', 'consent_pending', 'not_verified']
    },
    is_email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    failed_auth_attempt: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    created_by: {
        type: DataTypes.UUID
    },
    updated_by: {
        type: DataTypes.UUID
    },
    password_updated_at: {
        type: Sequelize.DATE
    },
    reset_password_token: {
        unique: true,
        type: DataTypes.STRING
    },
    reset_password_expires: {
        type: DataTypes.STRING
    },
    origin_url: {
        allowNull: false,
        type: DataTypes.STRING
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'hcp_profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

HcpProfile.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

HcpProfile.hasMany(HcpConsents, {
    as: 'hcpConsents',
    foreignKey: 'user_id'
});

HcpConsents.belongsTo(HcpProfile, {
    foreignKey: 'user_id'
});

module.exports = HcpProfile;
