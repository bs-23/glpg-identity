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
        rank: {
            unique: false,
            allowNull: true,
            type: DataTypes.INTEGER
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
        clinical_trial_purpose: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(10485760)
        },
        clinical_trial_summary: {
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
            type: DataTypes.STRING(60)
        },
        max_age: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(60)
        },
        std_age: {
            unique: false,
            allowNull: true,
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        phase: {
            unique: false,
            allowNull: true,
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        trial_status: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(60)
        },
        inclusion_exclusion_criteria: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(10485760)
        },
        type_of_drug: {
            unique: false,
            allowNull: true,
            type: DataTypes.STRING(60)
        }
    },
    db_schema: {
        schema: `${nodecache.getValue('POSTGRES_CLINICAL_TRIALS_SCHEMA')}`,
        tableName: this.name,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
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
