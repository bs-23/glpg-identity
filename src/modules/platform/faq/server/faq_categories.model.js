const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const uniqueSlug = require('unique-slug');

const convertToSlug = string => string.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
const makeCustomSlug = (title) => {
    const code = uniqueSlug(`${title}`);
    if (title.length > 50) return convertToSlug(`${title.substring(0, 50)} ${code}`);
    return convertToSlug(`${title} ${code}`);
};

const FaqCategories = sequelize.cdpConnector.define('faq_categories', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    title: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING(50),
    },
    slug: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING(70),
        set() {
            this.setDataValue('slug', makeCustomSlug(this.title));
        }
    },
    created_by: {
        type: DataTypes.UUID
    },
    updated_by: {
        type: DataTypes.UUID
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'faq_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = FaqCategories;
