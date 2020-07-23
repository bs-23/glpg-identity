const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const Consent = require('./consent.model');

const CountryConsent = sequelize.cdpConnector.define('country_consents', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    consent_id: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    slug: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING,
    },
    type: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['online', 'offline'],
    },
    opt_type: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['single', 'double'],
    },
    category: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['dm', 'mc']
    },
    category_title: {
        allowNull: false,
        type: DataTypes.STRING
    },
    country_iso2: {
        allowNull: false,
        type: DataTypes.STRING
    },
    language_code: {
        type: DataTypes.STRING
    },
    purpose: {
        type: DataTypes.STRING
    }
}, {
    schema: 'ciam',
    tableName: 'country_consents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

Consent.hasMany(CountryConsent, {
    foreignKey: 'consent_id'
});

CountryConsent.belongsTo(Consent, {
    foreignKey: 'consent_id'
});


module.exports = CountryConsent;
