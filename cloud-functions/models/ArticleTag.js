const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');
const Article = require('./Article');
const Tag = require('./Tag');

class ArticleTag extends Model { }

ArticleTag.init(
    {
        id: {
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        aid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {              // 数据库外键约束
                model: 'cms_article',          // 目标表
                key: 'id'                // 目标字段
            },
            comment: '文章id，外关键字，关联文章表'
        },
        tid: {
            type: DataTypes.INTEGER,
            references: {              // 数据库外键约束
                model: 'cms_tag',          // 目标表
                key: 'id'                // 目标字段
            },
            comment: '标签id，外关键字，关联标签表'
        }
    },
    {
        sequelize,
        tableName: 'cms_articletag',  // 指定表名
        timestamps: false,
        comment: '文章标签关联表'  // 表注释
    }
);

Article.belongsToMany(Tag, { through: ArticleTag });
Tag.belongsToMany(Article, { through: ArticleTag });

module.exports = ArticleTag;