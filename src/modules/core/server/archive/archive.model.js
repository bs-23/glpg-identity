const path = require('path');
const { DataTypes } = require('sequelize');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const Archive = sequelize.cdpConnector.define('archive', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    table_name: {
        type: DataTypes.ENUM,
        values: ['hcp_profiles', 'partner_requests', 'consent_locales']
    },
    object_id: {
        type: DataTypes.UUID
    },
    data: {
        allowNull: false,
        type: DataTypes.JSON
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
    tableName: 'archive',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Archive;
