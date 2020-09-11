const path = require("path");
const { DataTypes } = require("sequelize");
const sequelize = require(path.join(process.cwd(), "src/config/server/lib/sequelize"));
const Consent = require(path.join(process.cwd(), 'src/modules/consent/server/consent.model'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const HcpConsents = sequelize.cdpConnector.define("hcp_consents", {
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
    response: {
        allowNull: false,
        type: DataTypes.BOOLEAN
    },
    consent_confirmed: {
        type: DataTypes.BOOLEAN
    },
    created_by: {
        type: DataTypes.UUID
    },
    updated_by: {
        type: DataTypes.UUID
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: "hcp_consents",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});

HcpConsents.belongsTo(Consent, {
    foreignKey: 'consent_id'
});


module.exports = HcpConsents;
