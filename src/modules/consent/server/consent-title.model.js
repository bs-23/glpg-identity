const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

const ConsentTitle = sequelize.cdpConnector.define('consent_titles', {
    id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING
    },
    slug: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING,
    }
}, {
    schema: 'ciam',
    tableName: 'consent_titles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = ConsentTitle;
