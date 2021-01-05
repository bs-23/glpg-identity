const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const uniqueSlug = require('unique-slug');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const makeCustomSlug = (title) => {
    const code = uniqueSlug(`${title}`);
    if (title.length > 50) return convertToSlug(`${title.substring(0, 50)} ${code}`);
    return convertToSlug(`${title} ${code}`);
};

const Location = sequelize.clinitalTrialsStageConnectior.define('locatioin', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    LocationFacility: {
        unique: false,
        allowNull: true,
        type: DataTypes.STRING(1024)
    },
    LocationCity: {
        unique: false,
        allowNull: false,
        type: DataTypes.STRING(1024)
    },
    LocationZip: {
        unique: false,
        allowNull: false,
        type: DataTypes.STRING(1024)
    },
    LocationCountry: {
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
    },
    created_by: {
        type: DataTypes.UUID
    },
    updated_by: {
        type: DataTypes.UUID
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CLINICAL_TRIALS_SCHEMA')}`,
    tableName: 'location',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});



module.exports = Location;
