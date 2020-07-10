const path = require('path');
const { DataTypes } = require('sequelize');

const sequelize = require(path.join(process.cwd(),'src/config/server/lib/sequelize'));

const ResetPassword = sequelize.cdpConnector.define('reset_password', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        validate: {
            isUUID: 4
        }
    },
    user_id: {
        unique: true,
        allowNull: false,
        type: DataTypes.UUID,
        validate: {
            isUUID: 4
        }
    },
    token: {
        unique: true,
        type: DataTypes.STRING
    },
    expires_at: {
        type: DataTypes.DATE
    }
}, {
    schema: 'ciam',
    tableName: 'reset_password',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = ResetPassword;
