const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

let historyModel = {
    name: 'history',
    db_properties: {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        description: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(60)
        },
        value: {
            unique: false,
            allowNull: false,
            type: DataTypes.STRING(10485760)
        },
        log: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(1024)
        },
    },
    db_schema: {
        schema: `${nodecache.getValue('POSTGRES_CLINICAL_TRIALS_SCHEMA')}`,
        tableName: 'history',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
};

const history = sequelize.clinitalTrialsConnector.define(historyModel.name, historyModel.db_properties, historyModel.db_schema);

module.exports = history;
