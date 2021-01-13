const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const PartnerHcos = sequelize.cdpConnector.define('partner_hcos', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    contact_first_name: {
        allowNull: false,
        type: DataTypes.STRING(50),
    },
    contact_last_name: {
        allowNull: false,
        type: DataTypes.STRING(50),
    },
    name: {
        allowNull: false,
        type: DataTypes.STRING(50),
    },
    address_line_1: {
        type: DataTypes.STRING
    },
    address_line_2: {
        type: DataTypes.STRING
    },
    email: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING(100)
    },
    telephone: {
        type: DataTypes.STRING(25)
    },
    type: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['healthcare_org', 'patient_org'],
        defaultValue: 'healthcare_org'
    },
    registration_number: {
        type: DataTypes.STRING
    },
    iban: {
        type: DataTypes.STRING
    },
    bank_name: {
        type: DataTypes.STRING
    },
    bank_account_no: {
        type: DataTypes.STRING
    },
    currency: {
        type: DataTypes.STRING
    },
    document_urls: {
        type: DataTypes.ARRAY(DataTypes.STRING)
    },
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'partner_hcos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PartnerHcos;
