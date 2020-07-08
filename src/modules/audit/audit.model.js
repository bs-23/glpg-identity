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
    action: {
        allowNull: false,
        type: DataTypes.STRING
    },
    category: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['authentication', 'user'],
    },
    message: {
        allowNull: false,
        type: DataTypes.STRING
    },
    userId: {
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
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});


module.exports = Audit;
