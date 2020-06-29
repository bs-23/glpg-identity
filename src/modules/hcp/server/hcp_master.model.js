const path = require("path");
const { DataTypes } = require("sequelize");
const sequelize = require(path.join(process.cwd(), "src/config/server/lib/sequelize"));

const HcpMaster = sequelize.define("hcp_master", {
    Individual_Id_OneKey: {
        allowNull: false,
        type: DataTypes.STRING
    },
    Codbase: {
        allowNull: false,
        type: DataTypes.STRING
    },
    UUID_1: {
        type: DataTypes.STRING
    },
    UUID_2: {
        type: DataTypes.STRING
    },
    FirstName: {
        type: DataTypes.STRING
    },
    LastName: {
        type: DataTypes.STRING,
    },
    Phone: {
        type: DataTypes.STRING
    },
    Gender_Code: {
        type: DataTypes.STRING
    },
    Gender_Desc: {
        type: DataTypes.STRING
    },
    EMAIL_1: {
        type: DataTypes.STRING
    },
    Adr_Long_Lbl: {
        type: DataTypes.STRING
    },
    Fax: {
        type: DataTypes.STRING
    },
    LgPostCode: {
        type: DataTypes.STRING
    },
    Specialty1_Code: {
        type: DataTypes.STRING
    },
    Specialty2_Code: {
        type: DataTypes.STRING
    },
    Specialty3_Code: {
        type: DataTypes.STRING
    },
    Country_ISO2: {
        type: DataTypes.STRING
    }
}, {
    schema: "ciam",
    tableName: "hcp_master",

});


module.exports = HcpMaster;
