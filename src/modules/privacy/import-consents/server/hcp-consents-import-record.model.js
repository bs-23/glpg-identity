const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model'));
const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model'));

const HcpConsentsImportRecord = sequelize.cdpConnector.define('hcp_consents_import_records', {
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
    consent_locale: {
        allowNull: false,
        type: DataTypes.STRING(6)
    },
    result: {
        type: DataTypes.JSON
    },
    created_by: {
        type: DataTypes.UUID
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'hcp_consents_import_records',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

HcpConsentsImportRecord.belongsTo(User, { as: 'createdByUser', foreignKey: 'created_by' });
HcpConsentsImportRecord.belongsTo(Consent, { as: 'consent', foreignKey: 'consent_id' });

module.exports = HcpConsentsImportRecord;
