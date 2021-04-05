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
    entity_type: {
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
    mdr_id: {
        allowNull: false,
        type: DataTypes.STRING(25)
    },
    country_iso2: {
        allowNull: false,
        type: DataTypes.STRING
    },
    locale: {
        allowNull: false,
        type: DataTypes.STRING
    },
    is_supplier: {
        type: DataTypes.BOOLEAN
    },
    is_customer: {
        type: DataTypes.BOOLEAN
    },
    procurement_contact: {
        type: DataTypes.STRING(100)
    },
    partner_type: {
        type: DataTypes.STRING
    },
    uuid: {
        type: DataTypes.STRING(20)
    },
    onekey_id: {
        type: DataTypes.STRING
    },
    company_codes: {
        type: DataTypes.ARRAY(DataTypes.STRING),
    },
    workplace_name: {
        type: DataTypes.STRING
    },
    workplace_type: {
        type: DataTypes.ENUM,
        values: ['healthcare_org', 'patient_org'],
        defaultValue: null,
    },
    specialty: {
        type: DataTypes.STRING(50)
    },
    iqvia_wholesaler_id: {
        type: DataTypes.STRING,
    },
    status: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['new_request', 'email_sent', 'request_processed'],
        defaultValue: 'new_request'
    },
    created_by: {
        allowNull: false,
        type: DataTypes.UUID
    },
    updated_by: {
        allowNull: false,
        type: DataTypes.UUID
    },
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'partner_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PartnerRequest;
