// const path = require('path');
// const { DataTypes } = require('sequelize');
// const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
// const ConsentCategory = require('./consent-category.model');
// const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model.js'));
// const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

// const Consent = sequelize.cdpConnector.define('consents', {
//     id: {
//         allowNull: false,
//         primaryKey: true,
//         type: DataTypes.UUID,
//         defaultValue: DataTypes.UUIDV4
//     },
//     category_id: {
//         allowNull: false,
//         type: DataTypes.UUID
//     },
//     preference: {
//         unique: true,
//         allowNull: false,
//         type: DataTypes.STRING(60)
//     },
//     slug: {
//         unique: true,
//         allowNull: false,
//         type: DataTypes.STRING
//     },
//     legal_basis: {
//         allowNull: false,
//         type: DataTypes.ENUM,
//         values: ['consent', 'contract'],
//     },
//     is_active: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: false
//     },
//     created_by: {
//         type: DataTypes.UUID
//     },
//     updated_by: {
//         type: DataTypes.UUID
//     }
// }, {
//     schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
//     tableName: 'consents',
//     timestamps: true,
//     createdAt: 'created_at',
//     updatedAt: 'updated_at'
// });

// ConsentCategory.hasMany(Consent, {
//     foreignKey: 'category_id'
// });

// Consent.belongsTo(ConsentCategory, {
//     foreignKey: 'category_id'
// });

// Consent.belongsTo(User, { as: 'createdByUser', foreignKey: 'created_by' });
// Consent.belongsTo(User, { as: 'updatedByUser', foreignKey: 'updated_by' });

// module.exports = Consent;
