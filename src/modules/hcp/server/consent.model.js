const path = require("path");
const { DataTypes } = require("sequelize");
const sequelize = require(path.join(process.cwd(), "src/config/server/lib/sequelize"));


const Consents = sequelize.cdpConnector.define("consents", {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    title: {
        allowNull: false,
        type: DataTypes.STRING
    },
    type: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['online', 'offline'],
    },
    opt_in_type: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['single-opt', 'double-opt'],
    },
    category: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['DM', 'MC', 'GDPR']
    },
    country_code: {
        allowNull: false,
        type: DataTypes.STRING
    }
}, {
    schema: "ciam",
    tableName: "consents",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});

module.exports = Consents;
