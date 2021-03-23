const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model'));

const ConsentCategory = sequelize.cdpConnector.define('consent_categories', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    title: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING(50)
    },
    slug: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING
    },
    legal_title: {
        type: DataTypes.STRING(50)
    },
    created_by: {
        type: DataTypes.UUID
    },
    updated_by: {
        type: DataTypes.UUID
    },
    veeva_content_type_id: {
        unique: true,
        type: DataTypes.STRING(18)
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'consent_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

ConsentCategory.belongsTo(User, { as: 'createdByUser', foreignKey: 'created_by' });

module.exports = ConsentCategory;
