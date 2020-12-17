const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model.js'));
const validator = require('validator');

const Faq = sequelize.cdpConnector.define('faq', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    question: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING(60)
    },
    answer: {
        allowNull: false,
        type: DataTypes.STRING(1500),
        set(value) {
            this.setDataValue('answer', validator.escape(value));
        }
    },
    categories: {
        type: DataTypes.ARRAY(DataTypes.STRING)
    },
    created_by: {
        type: DataTypes.UUID
    },
    updated_by: {
        type: DataTypes.UUID
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_CDP_SCHEMA')}`,
    tableName: 'faq',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

Faq.belongsTo(User, { as: 'createdByUser', foreignKey: 'created_by' });
Faq.belongsTo(User, { as: 'updatedByUser', foreignKey: 'updated_by' });

module.exports = Faq;
