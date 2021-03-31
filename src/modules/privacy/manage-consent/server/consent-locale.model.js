const path = require('path');
const validator = require('validator');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model'));

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
        allowNull: false,
        type: DataTypes.STRING(6)
    },
    veeva_consent_type_id: {
        unique: true,
        type: DataTypes.STRING(18)
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'consent_locales',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

Consent.hasMany(ConsentLanguage, { foreignKey: 'consent_id' });
ConsentLanguage.belongsTo(Consent, { as: 'consent', foreignKey: 'consent_id' });

module.exports = ConsentLanguage;
