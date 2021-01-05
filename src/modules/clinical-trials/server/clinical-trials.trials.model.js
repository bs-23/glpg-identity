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

var trialsModel = {
    name: 'clinical_trials',
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
            type: DataTypes.STRING(256)
        },
        clinicalTrialSummary: {
            unique: false,
            allowNull: false,
            type: DataTypes.STRING(256)
        },
        gender: {
            unique: false,
            allowNull: false,
            type: DataTypes.STRING(60)
        },
        minAge: {
            unique: false,
            allowNull: false,
            type: DataTypes.STRING(60)
        },
        maxAge: {
            unique: false,
            allowNull: false,
            type: DataTypes.STRING(60)
        },
        stdAge: {
            unique: false,
            allowNull: false,
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        phase: {
            unique: false,
            allowNull: false,
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        trialStatus: {
            unique: false,
            allowNull: false,
            type: DataTypes.STRING(60)
        },
        clinicalTrialSummary: {
            unique: false,
            allowNull: false,
            type: DataTypes.STRING(256)
        },
        inclusionExclusionCriteria: {
            unique: false,
            allowNull: false,
            type: DataTypes.STRING(256)
        },
        typeOfDrug: {
            unique: false,
            allowNull: false,
            type: DataTypes.STRING(60)
        },
        location: {
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

const Trials = sequelize.clinitalTrialsStageConnectior.define(trialsModel.name, trialsModel.db_properties , trialsModel.db_schema);

Location.hasMany(Trials, {
    foreignKey: 'location_id'
});

Trials.belongsTo(Location, {
    foreignKey: 'location_id'
});



module.exports = Trials;
