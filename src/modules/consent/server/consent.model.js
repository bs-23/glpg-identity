const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

const Consent = sequelize.cdpConnector.define('consents', {
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
    }
}, {
    schema: 'ciam',
    tableName: 'consents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Consent;
