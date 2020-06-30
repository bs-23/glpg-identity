const path = require("path");
const { DataTypes } = require("sequelize");
const sequelize = require(path.join(process.cwd(), "src/config/server/lib/sequelize"));
const HCP = require(path.join(process.cwd(), "src/modules/hcp/server/hcp_profile.model"));
const Consents = require(path.join(process.cwd(), "src/modules/consent/server/consent.model.js"));

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
        type: DataTypes.Boolean
    },
    created_by: {
        type: DataTypes.UUID
    },
    updated_by: {
        type: DataTypes.UUID
    }
}, {
    schema: "ciam",
    tableName: "hcp_consents",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});

HCP.belongsToMany(Consents, { through: HcpConsents });
Consents.belongsToMany(HCP, { through: HcpConsents });

module.exports = HcpConsents;
