const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

const DatasyncHcpProfile = sequelize.datasyncConnector.define('vwhcpmaster', {
    individual_id_onekey: {
        unique: true,
        primaryKey: true,
        type: DataTypes.STRING
    },
    codbase: { type: DataTypes.STRING },
    country_iso2: { type: DataTypes.STRING },
    uuid_1: { type: DataTypes.STRING },
    uuid_2: { type: DataTypes.STRING },
    firstname: { type: DataTypes.STRING },
    lastname: { type: DataTypes.STRING },
    activity_id_onekey: { type: DataTypes.STRING },
    workplace_id_onekey: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    language_code: { type: DataTypes.STRING },
    gender_code: { type: DataTypes.STRING },
    gender_desc: { type: DataTypes.STRING },
    email_1: { type: DataTypes.STRING },
    adr_id_onekey: { type: DataTypes.STRING },
    address_lbl: { type: DataTypes.STRING },
    adr_long_lbl: { type: DataTypes.STRING },
    postal_city: { type: DataTypes.STRING },
    fax: { type: DataTypes.STRING },
    telephone: { type: DataTypes.STRING },
    telephone_2: { type: DataTypes.STRING },
    lgpostcode: { type: DataTypes.STRING },
    ind_type_code: { type: DataTypes.STRING },
    ind_type_desc: { type: DataTypes.STRING },
    status_code: { type: DataTypes.STRING },
    ind_status_desc: { type: DataTypes.STRING },
    donotcall: { type: DataTypes.STRING },
    donotvisit: { type: DataTypes.STRING },
    donotemail: { type: DataTypes.STRING },
    donotmail: { type: DataTypes.STRING },
    donotfax: { type: DataTypes.STRING },
    ind_privacylawenabled: { type: DataTypes.STRING },
    specialty_1_long_description: { type: DataTypes.STRING },
    specialty_1_code: { type: DataTypes.STRING },
    specialty_2_long_description: { type: DataTypes.STRING },
    specialty_2_code: { type: DataTypes.STRING },
    specialty_3_long_description: { type: DataTypes.STRING },
    specialty_3_code: { type: DataTypes.STRING }
}, {
    schema: `ciam`,
    tableName: 'vwhcpmaster',
    timestamps: false
});

module.exports = DatasyncHcpProfile;
