const path = require('path');
const { DataTypes } = require('sequelize');
const Application = require('./application.model');
const InformationType = require('./information-type.model');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const Information = sequelize.cdpConnector.define('informations', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    application_id: {
        allowNull: false,
        type: DataTypes.UUID
    },
    information_type_id: {
        allowNull: false,
        type: DataTypes.UUID
    },
    data: {
        allowNull: false,
        type: DataTypes.STRING
    },
    created_by: {
        type: DataTypes.UUID
    },
    updated_by: {
        type: DataTypes.UUID
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'informations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

Application.hasMany(Information, {
    as: 'informations_in_application',
    foreignKey: 'application_id'
});

Information.belongsTo(Application, {
    as: 'information_in_application',
    foreignKey: 'application_id'
});

InformationType.hasMany(Information, {
    as: 'informations_in_information_type',
    foreignKey: 'information_type_id'
});

Information.belongsTo(InformationType, {
    as: 'information_in_information_type',
    foreignKey: 'information_type_id'
});

module.exports = Information;
