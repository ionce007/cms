const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');
const Category = require('./Category');
const { calcReadTime } = require('../common/utils');

class Article extends Model { }

Article.init(
    {
        id: {
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: '文章ID，关键字串类型，自动递增',
        },
        cid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {              // 数据库外键约束
                model: 'cms_category',          // 目标表
                key: 'id'                // 目标字段
            },
            comment: '栏目id，外关键字，关联栏目表'
        },
        subCid: { type: DataTypes.STRING, comment: '其它栏目id' },
        title: { type: DataTypes.STRING, comment: '文章标题' },
        shortTitle: { type: DataTypes.STRING, comment: '文章简称' },
        tagId: { type: DataTypes.STRING, comment: '标签id' },
        attr: { type: DataTypes.STRING, comment: '1头条 2推荐 3轮播 4热门' },
        articleView: { type: DataTypes.STRING(100), comment: '详情页模板' },
        source: { type: DataTypes.STRING, comment: '文章来源' },
        author: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: { name: '缠说・股经', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop' },
            get() {
                const rawValue = this.getDataValue('settings');
                return rawValue ? JSON.parse(rawValue) : { name: '缠说・股经', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop' };
            },
            comment: '作者'
        },
        description: { type: DataTypes.STRING, comment: '文章概述' },
        img: { type: DataTypes.STRING, comment: '文章缩略图片' },
        content: { type: DataTypes.TEXT('medium'), comment: '文章内容' },
        status: { type: DataTypes.TINYINT, comment: '0 发布 1 不发布' },
        pv: { type: DataTypes.INTEGER, comment: '浏览量' },
        link: { type: DataTypes.STRING, comment: '外部链接' },
        readTime: {
            type: DataTypes.VIRTUAL,
            get() { return !this.content ? 0 : calcReadTime(this.content) }
        },
        featured: {
            type: DataTypes.VIRTUAL,
            get() { return !this.attr ? false : (this.attr.indexOf('1') >= 0 && this.attr.indexOf('2') >= 0); }
        },
        likes: { type: DataTypes.INTEGER, comment: '“喜欢”的点击数量' }
    },
    {
        sequelize,
        tableName: 'cms_article',  // 指定表名
        comment: '文章表'  // 表注释
    }
);
//Category.hasMany(Article, { foreignKey: 'cid'});
Category.hasMany(Article, { foreignKey: 'cid', as: 'Articles' });
Article.belongsTo(Category, { foreignKey: 'cid' });
module.exports = Article;

