const path = require('path');
const bcrypt = require('bcryptjs');
const { DataTypes } = require('sequelize');

const sequelize = require(path.join(process.cwd(),'src/config/server/lib/sequelize'));

const ResetPassword = sequelize.cdpConnector.define(
    'reset_password',
    {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            validate: {
                isUUID: 4,
            },
        },
        email: {
            unique: true,
            allowNull: false,
            type: DataTypes.STRING,
            validate: {
                isEmail: true,
            },
        },
        token: {
            type: DataTypes.STRING,
            set(value) {
                this.setDataValue('token', bcrypt.hashSync(value, 8));
            },
        },
        expire_at: {
            type: DataTypes.DATE,
        },
    },
    {
        schema: 'ciam',
        tableName: 'reset_password',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

ResetPassword.prototype.validToken = function(token) {
    return bcrypt.compareSync(token, this.token);
};

module.exports = ResetPassword;
