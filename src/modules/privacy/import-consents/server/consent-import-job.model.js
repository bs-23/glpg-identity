const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model'));
const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model'));

const ConsentImportJob = sequelize.cdpConnector.define('consent_import_jobs', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    consent_id: {
        allowNull: false,
        type: DataTypes.UUID
    },
    consent_category: {
        allowNull: false,
        type: DataTypes.UUID
    },
    consent_locale: {
        allowNull: false,
        type: DataTypes.STRING(6)
    },
    data: {
        type: DataTypes.JSON
    },
    status: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['not-ready', 'ready', 'completed', 'cancelled']
    },
    created_by: {
        type: DataTypes.UUID
    },
    updated_by: {
        type: DataTypes.UUID
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'consent_import_jobs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

ConsentImportJob.belongsTo(User, { as: 'createdByUser', foreignKey: 'created_by' });
ConsentImportJob.belongsTo(User, { as: 'updatedByUser', foreignKey: 'updated_by' });
ConsentImportJob.belongsTo(Consent, { as: 'consent', foreignKey: 'consent_id' });

module.exports = ConsentImportJob;
