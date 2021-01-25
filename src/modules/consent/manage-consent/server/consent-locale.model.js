const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const Consent = require(path.join(process.cwd(), 'src/modules/consent/manage-consent/server/consent.model.js'));
const validator = require('validator');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const ConsentLanguage = sequelize.cdpConnector.define('consent_locales', {
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
        type: DataTypes.STRING(1000),
        set(value) {
            this.setDataValue('rich_text', validator.escape(value));
        }
    },
    locale: {
        type: DataTypes.STRING
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'consent_locales',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

ConsentLanguage.belongsTo(Consent, { as: 'consent', foreignKey: 'consent_id' });

module.exports = ConsentLanguage;
