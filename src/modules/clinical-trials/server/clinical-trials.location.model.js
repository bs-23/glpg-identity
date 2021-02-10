const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

let locationModel = {
    name: 'locations',
    db_properties: {
        id: {
            allowNull: true,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        location_status: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(1024)
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
            allowNull: true,
            type: DataTypes.STRING(1024)
        },
        location_country: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(1024)
        },
        lat: {
            unique: false,
            allowNull: true,
            type: DataTypes.FLOAT()
        },
        lng: {
            unique: false,
            allowNull: true,
            type: DataTypes.FLOAT()
        }
    },
    db_schema: {
        schema: `${nodecache.getValue('POSTGRES_CLINICAL_TRIALS_SCHEMA')}`,
        tableName: 'locations',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
};

const Location = sequelize.clinitalTrialsConnector.define(locationModel.name, locationModel.db_properties, locationModel.db_schema);

module.exports = Location;
