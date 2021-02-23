const path = require('path');
const { DataTypes } = require('sequelize');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const Localization = sequelize.cdpConnector.define('localizations', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    language_family: {
        allowNull: false,
        type: DataTypes.STRING(25)
    },
    language_variant: {
        allowNull: false,
        type: DataTypes.STRING(50)
    },
    country_iso2: {
        type: DataTypes.STRING(2)
    },
    locale: {
        unique: true,
        type: DataTypes.STRING(6)
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'localizations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Localization;
