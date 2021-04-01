const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const  Partners = sequelize.cdpConnector.define('partners', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    entity_type: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['hcp', 'hco'],
        defaultValue: 'hcp'
    },
    request_id: {
        unique: true,
        allowNull: false,
        type: DataTypes.UUID
    },
    first_name: {
        allowNull: false,
        type: DataTypes.STRING(50),
    },
    last_name: {
        allowNull: false,
        type: DataTypes.STRING(50),
    },
    organization_name: {
        type: DataTypes.STRING(50),
    },
    address: {
        type: DataTypes.STRING
    },
    city: {
        type: DataTypes.STRING
    },
    post_code: {
        type: DataTypes.STRING
    },
    email: {
        allowNull: false,
        type: DataTypes.STRING(100),
        set(value){
            this.setDataValue('email', value.toLowerCase());
        }
    },
    telephone: {
        type: DataTypes.STRING(25)
    },
    individual_type: {
        type: DataTypes.ENUM,
        values: ['individual', 'legal_entity']
    },
    organization_type: {
        type: DataTypes.ENUM,
        values: ['healthcare_org', 'patient_org']
    },
    country_iso2: {
        allowNull: false,
        type: DataTypes.STRING(2)
    },
    locale: {
        allowNull: false,
        type: DataTypes.STRING(5)
    },
    registration_number: {
        type: DataTypes.STRING
    },
    uuid: {
        type: DataTypes.STRING(20)
    },
    onekey_id: {
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
        values: ['beneficiary_category_1', 'beneficiary_category_2']
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
    swift_code: {
        type: DataTypes.STRING
    },
    routing: {
        type: DataTypes.STRING
    },
    status: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: ['not_approved', 'approved'],
        defaultValue: 'not_approved'
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'partners',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Partners;
