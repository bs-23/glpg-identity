const path = require("path");
const { DataTypes } = require("sequelize");
const sequelize = require(path.join(process.cwd(), "src/config/server/lib/sequelize"));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const PasswordHistory = sequelize.cdpConnector.define("password_history", {
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
    passwords: {
        allowNull: false,
        type: DataTypes.ARRAY(DataTypes.STRING)
    },
    created_by: {
        type: DataTypes.UUID
    },
    updated_by: {
        type: DataTypes.UUID
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: "password_history",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});

module.exports = PasswordHistory;
