const path = require("path");
const { DataTypes } = require("sequelize");
const sequelize = require(path.join(process.cwd(), "src/config/server/lib/sequelize"));

const Persona = sequelize.cdpConnector.define("personas", {
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
    description: {
        type: DataTypes.STRING
    },
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
    },
    specialties: {
        type: DataTypes.ARRAY(DataTypes.STRING),
    },
    created_by: {
        type: DataTypes.UUID
    },
    updated_by: {
        type: DataTypes.UUID
    }
}, {
    schema: "ciam",
    tableName: "personas",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});

module.exports = Persona;
