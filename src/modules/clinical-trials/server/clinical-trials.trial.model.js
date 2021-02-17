const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const Location = require(path.join(process.cwd(), 'src/modules/clinical-trials/server/clinical-trials.location.model.js'));

let trialModel = {
    name: 'clinical_trials',
    db_properties: {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        protocol_number: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(60)
        },
        gov_identifier: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(60)
        },
        clinical_trial_brief_summary: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(10485760)
        },
        clinical_trial_brief_title: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(10485760)
        },
        gender: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(60)
        },
        min_age: {
            unique: false,
            allowNull: true,
            type: DataTypes.INTEGER()
        },
        max_age: {
            unique: false,
            allowNull: true,
            type: DataTypes.INTEGER()
        },
        std_age: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(100)
        },
        phase: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(100)
        },
        trial_status: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(60)
        },
        type_of_drug: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(60)
        },
        eudract_number: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(60)
        },
        trial_start_date: {
            allowNull: true,
            type: DataTypes.DATE,
            defaultValue: null
        },
        trial_end_date: {
            allowNull: true,
            type: DataTypes.DATE,
            defaultValue: null
        },
        story_telling: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(10485760)
        },
        official_title: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(10485760)
        },
        indication: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(60)
        },
        indication_group: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(60)
        },
        trial_fixed_id: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(60)
        },
        inclusion_criteria: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(10485760)
        },
        exclusion_criteria: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(10485760)
        },
        note_criteria: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(10485760)
        }

    },
    db_schema: {
        schema: `${nodecache.getValue('POSTGRES_CLINICAL_TRIALS_SCHEMA')}`,
        tableName: 'clinical_trials',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        charset: 'utf8',
        collate: 'utf8_unicode_ci'
    }
};

const Trial = sequelize.clinitalTrialsConnector.define(trialModel.name, trialModel.db_properties , trialModel.db_schema);

Trial.hasMany(Location, { as: "locations" });
Location.belongsTo(Trial, {
  foreignKey: "trial_id",
  as: "trial",
});

Location.belog

module.exports = Trial;
