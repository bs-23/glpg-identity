const path = require("path");
const { DataTypes } = require("sequelize");
const sequelize = require(path.join(process.cwd(), "src/config/server/lib/sequelize"));

const Filter = sequelize.cdpConnector.define("filter", {
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
    list_name: {
        allowNull: false,
        type: DataTypes.STRING
    },
    option: {
        allowNull: false,
        type: DataTypes.JSON
    },
}, {
    schema: "cdp",
    tableName: "filter",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});

module.exports = Filter;
