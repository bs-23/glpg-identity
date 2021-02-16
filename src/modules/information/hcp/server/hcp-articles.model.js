const path = require('path');
const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const HcpArticles = sequelize.ppiConnector.define('hcp_articles', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    author_name: {
        allowNull: false,
        type: DataTypes.STRING
    },
    article_title: {
        allowNull: false,
        type: DataTypes.TEXT
    },
    article_abstract: {
        allowNull: true,
        type: DataTypes.TEXT
    },
    article_url: {
        allowNull: false,
        type: DataTypes.STRING
    },
    citation_count: {
        allowNull: true,
        type: DataTypes.INTEGER
    },
    co_authors: {
        allowNull: true,
        type: DataTypes.STRING
    },
    individual_onekeyID: {
        allowNull: false,
        type: DataTypes.STRING
    }, 
    uuid: {
        allowNull: false,
        type: DataTypes.STRING
    }
}, {
    schema: `${nodecache.getValue('POSTGRES_PPI_SCHEMA')}`,
    tableName: 'hcp_articles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = HcpArticles; 