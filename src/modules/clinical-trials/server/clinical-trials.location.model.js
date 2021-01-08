const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const Location = sequelize.clinitalTrialsConnector.define('locations', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    location_facility: {
        unique: false,
        allowNull: true,
        type: DataTypes.STRING(1024)
    },
    location_city: {
        unique: false,
        allowNull: true,
        type: DataTypes.STRING(1024)
    },
    location_zip: {
        unique: false,
        allowNull: false,
        type: DataTypes.STRING(1024)
    },
    location_country: {
        unique: false,
        allowNull: false,
        type: DataTypes.STRING(1024)
    },
    lat: {
        unique: false,
        allowNull: true,
        type: DataTypes.FLOAT()
    },
    long: {
        unique: false,
        allowNull: true,
        type: DataTypes.FLOAT()
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CLINICAL_TRIALS_SCHEMA')}`,
    tableName: 'locations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Location;
