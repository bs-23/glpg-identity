const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

const Consent = sequelize.cdpConnector.define('consents', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    title: {
        unique: true,
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
    tableName: 'consents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Consent;
