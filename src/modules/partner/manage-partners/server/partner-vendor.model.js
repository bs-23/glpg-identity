const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const PartnerVendors = sequelize.cdpConnector.define('partner_vendors', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    requestor_first_name: {
        type: DataTypes.STRING(50)
    },
    requestor_last_name: {
        type: DataTypes.STRING(50)
    },
    purchasing_org: {
        type: DataTypes.STRING,
    },
    company_code: {
        type: DataTypes.STRING,
    },
    requestor_email: {
        type: DataTypes.STRING(100)
    },
    procurement_contact: {
        type: DataTypes.STRING(100)
    },
    name: {
        allowNull: false,
        type: DataTypes.STRING(100)
    },
    registration_number: {
        allowNull: false,
        type: DataTypes.STRING
    },
    address: {
        allowNull: false,
        type: DataTypes.STRING
    },
    city: {
        allowNull: false,
        type: DataTypes.STRING
    },
    post_code: {
        type: DataTypes.STRING
    },
    telephone: {
        type: DataTypes.STRING(25)
    },
    invoice_contact_name: {
        type: DataTypes.STRING
    },
    invoice_address: {
        type: DataTypes.STRING
    },
    invoice_city: {
        type: DataTypes.STRING
    },
    invoice_post_code: {
        type: DataTypes.STRING
    },
    invoice_email: {
        type: DataTypes.STRING(100)
    },
    invoice_telephone: {
        type: DataTypes.STRING(25)
    },
    commercial_contact_name: {
        type: DataTypes.STRING
    },
    commercial_address: {
        type: DataTypes.STRING
    },
    commercial_city: {
        type: DataTypes.STRING
    },
    commercial_post_code: {
        type: DataTypes.STRING
    },
    commercial_email: {
        type: DataTypes.STRING(100)
    },
    commercial_telephone: {
        type: DataTypes.STRING(25)
    },
    ordering_contact_name: {
        type: DataTypes.STRING
    },
    ordering_email: {
        allowNull: false,
        type: DataTypes.STRING(100)
    },
    ordering_telephone: {
        type: DataTypes.STRING(25)
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
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'partner_vendors',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PartnerVendors;
