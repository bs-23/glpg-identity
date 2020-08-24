const path = require('path');
const bcrypt = require('bcryptjs');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const HcpConsents = require('./hcp_consents.model');

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
        unique: true,
        type: DataTypes.STRING
    },
    individual_id_onekey: {
        unique: true,
        type: DataTypes.STRING
    },
    salutation: {
        allowNull: false,
        type: DataTypes.STRING
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
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING,
        set(value) {
            this.setDataValue('password', bcrypt.hashSync(value, 8));
        }
    },
    telephone: {
        type: DataTypes.STRING
    },
    country_iso2: {
        allowNull: false,
        type: DataTypes.STRING
    },
    language_code: {
        allowNull: false,
        type: DataTypes.STRING
    },
    specialty_onekey: {
        allowNull: false,
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.ENUM,
        values: ['self_verified', 'manually_verified', 'consent_pending', 'not_verified']
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
    reset_password_token: {
        unique: true,
        type: DataTypes.STRING
    },
    reset_password_expires: {
        type: DataTypes.STRING
    }
}, {
    schema: 'ciam',
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
})

module.exports = HcpProfile;
