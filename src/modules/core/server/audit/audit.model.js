const path = require('path');
const { DataTypes } = require('sequelize');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

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
        values: ['CREATE', 'DELETE', 'UPDATE', 'LOGIN', 'LOGOUT', 'UNAUTHORIZE', 'BAD_REQUEST']
    },
    object_id: {
        type: DataTypes.STRING
    },
    table_name: {
        type: DataTypes.ENUM,
        values: ['users', 'hcp_profiles', 'consents', 'faq', 'applications', 'permission_sets', 'roles', 'consent_countries', 'consent_categories', 'consent_locales', 'archive', 'partner_requests']
    },
    actor: {
        allowNull: false,
        type: DataTypes.UUID
    },
    changes: {
        type: DataTypes.JSON
    },
    remarks: {
        type: DataTypes.STRING(500)
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'audits',
    timestamps: false
});

module.exports = Audit;
