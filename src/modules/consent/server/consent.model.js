const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const uniqueSlug = require('unique-slug');
const ConsentCategory = require('./consent-category.model');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const convertToSlug = string => string.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
const makeCustomSlug = (title) => {
    const code = uniqueSlug(`${title}`);
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
    legal_basis: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['consent', 'contract'],
    },
    preference: {
        type: DataTypes.STRING
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
        set() {
            this.setDataValue('slug', makeCustomSlug(this.title));
        }
    },

}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
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
