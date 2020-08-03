const path = require('path');
const validator = require('validator');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const uniqueSlug = require('unique-slug');
const ConsentCategory = require('./consent-category.model');

const convertToSlug = string => string.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
const makeCustomSlug = (title, country, language) => {
    const code = uniqueSlug(`${title} ${country} ${language}`);
    if(title.length > 50) return convertToSlug(`${title.substring(0, 50)} ${code}`);
    return convertToSlug(`${title} ${code}`);
};

const Consent = sequelize.cdpConnector.define('consents', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    },
    category_id: {
        allowNull: false,
        type: DataTypes.UUID
    },
    title: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING
    },
    rich_text: {
        allowNull: false,
        type: DataTypes.STRING(500),
        set(value) {
            this.setDataValue('rich_text', validator.escape(value));
        }
    },
    slug: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING,
        set() {
            this.setDataValue('slug', makeCustomSlug(this.title, this.country_iso2, this.language_code));
        }
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
