const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const uniqueSlug = require('unique-slug');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const Location = require(path.join(process.cwd(), 'src/modules/clinical-trials/server/clinical-trials.location.model.js'));

const makeCustomSlug = (title) => {
    const code = uniqueSlug(`${title}`);
    if (title.length > 50) return convertToSlug(`${title.substring(0, 50)} ${code}`);
    return convertToSlug(`${title} ${code}`);
};

let trialModel = {
    name: 'clinical_trial',
    db_properties: {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        rank: {
            unique: false,
            allowNull: true,
            type: DataTypes.INTEGER
        },
        protocolNumber: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(60)
        },
        govIdentifier: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(60)
        },
        clinicalTrialPurpose: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(10485760)
        },
        clinicalTrialSummary: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(10485760)
        },
        gender: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(60)
        },
        minAge: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(60)
        },
        maxAge: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(60)
        },
        stdAge: {
            unique: false,
            allowNull: true,
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        phase: {
            unique: false,
            allowNull: true,
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        trialStatus: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(60)
        },
        inclusionExclusionCriteria: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(10485760)
        },
        typeOfDrug: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(60)
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
        tableName: this.name,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}

const Trial = sequelize.clinitalTrialsStageConnectior.define(trialModel.name, trialModel.db_properties , trialModel.db_schema);

Location.hasMany(Trial, {
    foreignKey: 'location_id'
});

module.exports = Trial;
