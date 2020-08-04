const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const Consent = require('./consent.model');
const validator = require('validator');


const ConsentLanguage = sequelize.cdpConnector.define('consent_languages', {
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

    rich_text: {
        allowNull: false,
        type: DataTypes.STRING(500),
        set(value) {
            this.setDataValue('rich_text', validator.escape(value));
        }
    },

    country_iso2: {
        allowNull: false,
        type: DataTypes.STRING
    },

    language_code: {
        type: DataTypes.STRING
    }
    
}, {
    schema: 'ciam',
    tableName: 'consent_languages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

ConsentLanguage.belongsTo(Consent, {as: 'consent', foreignKey: 'consent_id'});

module.exports = ConsentLanguage;
