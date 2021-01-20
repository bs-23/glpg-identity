const path = require('path');
const { DataTypes } = require('sequelize');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const Archive = sequelize.cdpConnector.define('archives', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    table_name: {
        type: DataTypes.ENUM,
        values: ['users', 'hcp_profiles', 'consents', 'faq', 'applications', 'hcp_archives', 'permission_sets', 'roles', 'consent_countries', 'consent_categories', 'consent_locales', 'partner_requests']
    },
    object_id: {
        type: DataTypes.STRING
    },
    data: {
        allowNull: false,
        type: DataTypes.STRING(5000)
    },
    actor: {
        allowNull: false,
        type: DataTypes.UUID
    },
    remarks: {
        type: DataTypes.STRING(500)
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'archives',
    timestamps: false,
    createdAt: 'created_at',
});

module.exports = Archive;
