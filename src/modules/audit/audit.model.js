const path = require('path');
const { DataTypes } = require('sequelize');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

const Audit = sequelize.cdpConnector.define('audits', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    event_name: {
        allowNull: false,
        type: DataTypes.STRING
    },
    event_time: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    event_type: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['USER_LOGIN','USER_LOGOUT', 'CREATE_USER', 'DELETE_USER', 'UPDATE_USER'],
    },
    message: {
        allowNull: false,
        type: DataTypes.STRING
    },
    object_id: {
        type: DataTypes.STRING
    },

    created_by: {
        type: DataTypes.UUID,
        validate: {
            customValidator(value) {
                if (value === null && this.type !== 'admin') {
                    throw new Error("created_by is required for basic user");
                }
            }
        }
    }
}, {
    schema: 'ciam',
    tableName: 'audits',
    timestamps: false,
});


module.exports = Audit;
