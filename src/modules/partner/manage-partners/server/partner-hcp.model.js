const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const PartnerHcps = sequelize.cdpConnector.define('partner_hcps', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    first_name: {
        allowNull: false,
        type: DataTypes.STRING(50),
    },
    last_name: {
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
        values: ['individual', 'legal_entity'],
        defaultValue: 'individual'
    },
    uuid: {
        type: DataTypes.STRING
    },
    is_italian_hcp: {
        type: DataTypes.BOOLEAN
    },
    should_report_hco: {
        type: DataTypes.BOOLEAN
    },
    beneficiary_category: {
        type: DataTypes.ENUM,
        values: ['beneficiary_category_1', 'beneficiary_category_2'],
        defaultValue: 'beneficiary_category_1'
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
    tableName: 'partner_hcps',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PartnerHcps;
