const path = require("path");
const { DataTypes } = require("sequelize");
const sequelize = require(path.join(process.cwd(), "src/config/server/lib/sequelize"));

const HcpMaster = sequelize.define("hcp_master", {
    individual_id_oneKey: {
        allowNull: false,
        type: DataTypes.STRING
    },
    codbase: {
        allowNull: false,
        type: DataTypes.STRING
    },
    uuid_1: {
        type: DataTypes.STRING
    },
    uuid_2: {
        type: DataTypes.STRING
    },
    firstname: {
        type: DataTypes.STRING
    },
    lastname: {
        type: DataTypes.STRING,
    },
    phone: {
        type: DataTypes.STRING
    },
    gender_code: {
        type: DataTypes.STRING
    },
    gender_desc: {
        type: DataTypes.STRING
    },
    email_1: {
        type: DataTypes.STRING
    },
    adr_long_lbl: {
        type: DataTypes.STRING
    },
    fax: {
        type: DataTypes.STRING
    },
    lgpostcode: {
        type: DataTypes.STRING
    },
    specialty1_code: {
        type: DataTypes.STRING
    },
    specialty2_code: {
        type: DataTypes.STRING
    },
    specialty3_code: {
        type: DataTypes.STRING
    },
    country_iso2: {
        type: DataTypes.STRING
    }
}, {
    schema: "ciam",
    tableName: "hcp_master",

});


module.exports = HcpMaster;
