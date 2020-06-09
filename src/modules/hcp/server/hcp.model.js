const path = require("path");
const bcrypt = require("bcryptjs");
const { DataTypes } = require("sequelize");
const sequelize = require(path.join(process.cwd(), "src/config/server/lib/sequelize"));

const Hcp = sequelize.define("hcps", {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    application_id: {
        allowNull: false,
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
    tableName: "hcps",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});

Hcp.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = Hcp;
