const path = require("path");
const { DataTypes } = require("sequelize");
const sequelize = require(path.join(process.cwd(), "src/config/server/lib/sequelize"));

const Country = sequelize.define("country", {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        validate: {
            isUUID: 4,
        },
    },
    name: {
        allowNull: false,
        type: DataTypes.STRING
    }
}, {
    schema: "ciam",
    tableName: "countries",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});


module.exports = Country;
