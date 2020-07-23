const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const ConsentCategory = require('./consent-category.model');

const Consent = sequelize.cdpConnector.define('consents', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    category_id: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    title: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING
    },
    markup: {
        allowNull: false,
        type: DataTypes.STRING
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
    tableName: 'consents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

ConsentCategory.hasMany(Consent, {
    foreignKey: 'category_id'
});

Consent.belongsTo(ConsentCategory, {
    foreignKey: 'category_id'
});

module.exports = Consent;
