const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const Consent = require('./consent.model');


const ConsentCountry = sequelize.cdpConnector.define('consent_countries', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    consent_id: {
        allowNull: false,
        type: DataTypes.UUID
    },

    country_iso2: {
        allowNull: false,
        type: DataTypes.STRING
    },
    opt_type: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['single', 'double'],
    }

}, {
    schema: 'ciam',
    tableName: 'consent_countries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

ConsentCountry.belongsTo(Consent, {as: 'consent', foreignKey: 'consent_id'});

module.exports = ConsentCountry;
