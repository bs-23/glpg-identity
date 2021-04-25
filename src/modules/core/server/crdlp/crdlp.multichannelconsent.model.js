const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

const MultichannelConsent = sequelize.datasyncConnector.define('vw_veeva_consent_master', {
    onekeyid: { type: DataTypes.STRING(30), primaryKey: true },
    uuid_mixed: { type: DataTypes.STRING },
    account_name: { type: DataTypes.STRING },
    content_type: { type: DataTypes.STRING(80) },
    capture_datetime: { type: DataTypes.DATE },
    country_code: { type: DataTypes.STRING(10) },
    channel_value: { type: DataTypes.STRING },
    opt_type: { type: DataTypes.STRING },
    opt_expiration_date: { type: DataTypes.DATE },
    glpg_consent_source: { type: DataTypes.STRING },
    zvod_consent_default_consent_text_vod: { type: DataTypes.STRING },
    default_consent_text_vod: { type: DataTypes.TEXT },
    disclaimer_text_vod: { type: DataTypes.TEXT }
}, {
    schema: `ciam`,
    tableName: 'vw_veeva_consent_master',
    timestamps: false
});

exports.MultichannelConsent = MultichannelConsent;
