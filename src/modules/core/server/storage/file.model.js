const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const File = sequelize.cdpConnector.define('files', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    name: {
        allowNull: false,
        type: DataTypes.STRING(224)
    },
    bucket_name: {
        allowNull: false,
        type: DataTypes.STRING
    },
    key: {
        allowNull: false,
        type: DataTypes.STRING
    },
    owner_id: {
        type: DataTypes.UUID
    },
    table_name: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['partners', 'partner_vendors', 'applications', 'consent_import_jobs'],
        defaultValue: 'partners'
    },
    created_by: {
        type: DataTypes.UUID
    },
    updated_by: {
        type: DataTypes.UUID
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'files',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = File;
