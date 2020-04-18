const bcrypt = require("bcryptjs");
const { DataTypes } = require("sequelize");
const sequelize = require("../config/lib/sequelize");

const User = sequelize.define("user", {
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
    email: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING,
    },
    password: {
        type: DataTypes.STRING
    },
    role: {
        allowNull: false,
        type: DataTypes.STRING
    },
    created_by: {
        type: DataTypes.UUID
    }
}, {
    schema: "ciam",
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    instanceMethods: {
        validPassword(password) {
            return bcrypt.compareSync(password, this.password);
        }
    }
});

const setHashedPassword = user => {
    if(user.changed("password")) {
        user.password = bcrypt.hashSync(user.password, 8);
    }
};

User.beforeCreate(setHashedPassword);
User.beforeUpdate(setHashedPassword);

module.exports = User;
