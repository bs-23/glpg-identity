const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const uniqueSlug = require('unique-slug');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const makeCustomSlug = (title) => {
    const code = uniqueSlug(`${title}`);
    if (title.length > 50) return convertToSlug(`${title.substring(0, 50)} ${code}`);
    return convertToSlug(`${title} ${code}`);
};

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
    created_by: {
        type: DataTypes.UUID
    },
    updated_by: {
        type: DataTypes.UUID
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CLINICAL_TRIALS_SCHEMA')}`,
    tableName: 'history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});



module.exports = history;
