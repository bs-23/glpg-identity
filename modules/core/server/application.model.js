const path = require("path");
const { DataTypes } = require("sequelize");
const sequelize = require(path.join(process.cwd(), "config/server/lib/sequelize"));

const Application = sequelize.define("application", {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    name: {
        allowNull: false,
        type: DataTypes.STRING
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    created_by: {
        type: DataTypes.UUID
    },
    updated_by: {
        type: DataTypes.UUID
    }
}, {
    schema: "ciam",
    tableName: "applications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});

module.exports = Application;
