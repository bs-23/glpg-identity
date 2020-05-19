const path = require("path");
const { DataTypes } = require("sequelize");
const sequelize = require(path.join(process.cwd(), "src/config/server/lib/sequelize"));

const Country = sequelize.define("country", {
    id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
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
