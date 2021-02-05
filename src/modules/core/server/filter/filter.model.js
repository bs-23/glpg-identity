const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

const FilterSettings = sequelize.cdpConnector.define('filter_settings', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    title: {
        allowNull: false,
        type: DataTypes.STRING(35)
    },
    user_id: {
        allowNull: false,
        type: DataTypes.UUID
    },
    table_name: {
        allowNull: false,
        type: DataTypes.STRING
    },
    settings: {
        allowNull: false,
        type: DataTypes.JSON
    },
}, {
    schema: 'cdp',
    tableName: 'filter_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = FilterSettings;
