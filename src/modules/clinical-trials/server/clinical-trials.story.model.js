const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

let storyModel = {
    name: 'story',
    db_properties: {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        trial_fixed_id: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(60)
        },
        version: {
            unique: true,
            allowNull: false,
            type: DataTypes.INTEGER()
        },
        value: {
            unique: false,
            allowNull: false,
            type: DataTypes.STRING(10485760)
        },
        created_by: {
            type: DataTypes.UUID
        },
        updated_by: {
            type: DataTypes.UUID
        }
        
    },
    db_schema: {
        schema: `${nodecache.getValue('POSTGRES_CLINICAL_TRIALS_SCHEMA')}`,
        tableName: 'story',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        charset: 'utf8',
        collate: 'utf8_unicode_ci'
    }
};

const story = sequelize.clinitalTrialsConnector.define(storyModel.name, storyModel.db_properties, storyModel.db_schema);

module.exports = story;
