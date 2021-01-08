const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const history = sequelize.clinitalTrialsConnector.define('history', {
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
}, {
    schema: `${nodecache.getValue('POSTGRES_CLINICAL_TRIALS_SCHEMA')}`,
    tableName: 'history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = history;
