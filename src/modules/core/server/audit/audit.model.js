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
    event_time: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    event_type: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['CREATE', 'DELETE', 'UPDATE']
    },
    object_id: {
        type: DataTypes.STRING
    },
    table_name: {
        type: DataTypes.ENUM,
        values: ['users', 'hcp_profiles', 'consents', 'applications', 'personas']
    },
    created_by: {
        allowNull: false,
        type: DataTypes.UUID
    },
    description: {
        type: DataTypes.STRING
    }
}, {
    schema: 'ciam',
    tableName: 'audits',
    timestamps: false
});

module.exports = Audit;
