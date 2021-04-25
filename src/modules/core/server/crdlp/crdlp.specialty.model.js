const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

const Specialty = sequelize.datasyncConnector.define('vwspecialtymaster', {
    cod_id_onekey: { type: DataTypes.STRING, primaryKey: true },
    codbase: { type: DataTypes.STRING },
    cod_locale: { type: DataTypes.STRING },
    cod_description: { type: DataTypes.STRING }
}, {
    schema: `ciam`,
    tableName: 'vwspecialtymaster',
    timestamps: false
});

exports.Specialty = Specialty;
