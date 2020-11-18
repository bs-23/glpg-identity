const path = require('path');
const { DataTypes } = require('sequelize');
const Application = require('./application.model');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const Data = sequelize.cdpConnector.define('datas', {
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
    type: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING,
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
    tableName: 'datas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

Application.hasMany(Data, {
    as: 'datas_in_application',
    foreignKey: 'application_id'
});

Data.belongsTo(Application, {
    as: 'data_in_application',
    foreignKey: 'application_id'
});

module.exports = Data;
