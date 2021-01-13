const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const PartnerRequest = sequelize.cdpConnector.define('partner_requests', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    application_id: {
        allowNull: false,
        type: DataTypes.UUID,
    },
    type: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['hcp', 'hco', 'vendor', 'wholesaler']
    },
    first_name: {
        allowNull: false,
        type: DataTypes.STRING(50),
    },
    last_name: {
        allowNull: false,
        type: DataTypes.STRING(50),
    },
    email: {
        allowNull: false,
        type: DataTypes.STRING(100)
    },
    procurement_contact: {
        allowNull: false,
        type: DataTypes.STRING(100)
    },
    purchasing_organization: {
        type: DataTypes.STRING(100),
    },
    company_codes: {
        type: DataTypes.ARRAY(DataTypes.STRING)
    },
    country_iso2: {
        allowNull: false,
        type: DataTypes.STRING
    },
    language: {
        allowNull: false,
        type: DataTypes.STRING
    },
    status: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['new', 'pending'],
        defaultValue: 'new'
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'partner_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PartnerRequest;
