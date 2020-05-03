const path = require("path");
const bcrypt = require("bcryptjs");
const { DataTypes } = require("sequelize");
const sequelize = require(path.join(process.cwd(), "src/config/server/lib/sequelize"));

const User = sequelize.define("user", {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    application_id: {
        type: DataTypes.UUID
    },
    name: {
        allowNull: false,
        type: DataTypes.STRING
    },
    email: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING,
        set(value) {
            this.setDataValue("password", bcrypt.hashSync(value, 8));
        }
    },
    phone: {
        type: DataTypes.STRING
    },
    type: {
        type: DataTypes.ENUM,
        values: ["System Admin", "Site Admin"]
    },
    countries: {
        type: DataTypes.ARRAY(DataTypes.STRING)
    },
    permissions: {
        type: DataTypes.ARRAY(DataTypes.STRING)
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
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});

User.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = User;
