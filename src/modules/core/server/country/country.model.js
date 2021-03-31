const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const Country = sequelize.cdpConnector.define('countries', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    country_iso2: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING(2)
    },
    country_iso3: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING(3)
    },
    codbase: {
        allowNull: false,
        type: DataTypes.STRING(3)
    },
    countryname: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING(14)
    },
    codbase_desc: {
        allowNull: false,
        type: DataTypes.STRING(30)
    },
    codbase_desc_okws: {
        type: DataTypes.STRING(30)
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'countries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Country;
