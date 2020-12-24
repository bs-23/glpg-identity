const path = require('path');
const { DataTypes } = require('sequelize');

const sequelize = require(path.join(process.cwd(),'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

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
    type: {
        type: DataTypes.ENUM,
        values: ['set', 'reset'],
        defaultValue: 'reset'
    },
    token: {
        unique: true,
        type: DataTypes.STRING
    },
    expires_at: {
        type: DataTypes.DATE
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'reset_password',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = ResetPassword;
