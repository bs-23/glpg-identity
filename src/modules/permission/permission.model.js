const path = require('path');
const { DataTypes } = require('sequelize');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

const Permission = sequelize.cdpConnector.define('permissions', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4

    },
    identifier: {
        allowNull: false,
        type: DataTypes.STRING
    },

    status: {
        type: DataTypes.STRING
    },

    methods: {
        type: DataTypes.ARRAY(DataTypes.STRING)
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
    },
    updated_by: {
        type: DataTypes.UUID,
        validate: {
            customValidator(value) {
                if (value === null && this.type !== 'admin') {
                    throw new Error("updated_by is required for basic user");
                }
            }
        }
    },
}, {
    schema: 'ciam',
    tableName: 'permissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});


module.exports = Permission;
