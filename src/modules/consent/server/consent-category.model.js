const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

const ConsentCategory = sequelize.cdpConnector.define('consent_categories', {
    id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        allowNull: false,
        type: DataTypes.STRING
    },
    type: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['dm', 'mc', 'general']
    }
}, {
    schema: 'ciam',
    tableName: 'consent_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = ConsentCategory;
