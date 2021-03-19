const path = require('path');
const validator = require('validator');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model'));

const HcpConsents = sequelize.cdpConnector.define('hcp_consents', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    user_id: {
        allowNull: false,
        type: DataTypes.UUID
    },
    consent_id: {
        allowNull: false,
        type: DataTypes.UUID
    },
    consent_confirmed: {
        type: DataTypes.BOOLEAN
    },
    opt_type: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['single-opt-in', 'double-opt-in', 'soft-opt-in', 'opt-out'],
    },
    rich_text: {
        allowNull: false,
        type: DataTypes.STRING(1000),
        set(value) {
            this.setDataValue('rich_text', validator.escape(value));
        },
        get() {
            const rawValue = this.getDataValue('rich_text');
            return rawValue ? validator.unescape(rawValue) : '';
        }
    },
    consent_locale: {
        allowNull: false,
        type: DataTypes.STRING(5)
    },
    created_by: {
        type: DataTypes.UUID
    },
    updated_by: {
        type: DataTypes.UUID
    },
    veeva_multichannel_consent_id: {
        type: DataTypes.STRING(18)
    },
    expired_at: {
        type: DataTypes.DATE
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'hcp_consents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

HcpConsents.belongsTo(Consent, {
    foreignKey: 'consent_id'
});

module.exports = HcpConsents;
