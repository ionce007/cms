const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');

class Category extends Model { }

Category.init(
    {
        id: {
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: '栏目ID，关键字串类型，自动递增',
        },
        pid: { type: DataTypes.INTEGER, comment: '父栏目id' },
        seoTitle: { type: DataTypes.STRING, comment: '栏目SEO标题' },
        seoKeywords: { type: DataTypes.STRING, comment: '栏目SEO关键字' },
        seoDescription: { type: DataTypes.STRING, comment: '栏目SEO描述' },
        name: { type: DataTypes.STRING(50), comment: '栏目名称' },
        pinyin: { type: DataTypes.STRING, comment: '栏目拼音' },
        path: { type: DataTypes.STRING, comment: '栏目路径' },
        description: { type: DataTypes.STRING, comment: '栏目描述' },
        type: { type: DataTypes.STRING(2), comment: '栏目类型, 0 栏目 1 页面' },
        url: { type: DataTypes.STRING, comment: '栏目链接' },
        orderBy: { type: DataTypes.INTEGER, comment: '栏目排序' },
        target: { type: DataTypes.STRING(2), comment: '打开方式 0-当前页面打开  1-新页面打开' },
        status: { type: DataTypes.STRING(2), comment: '栏目状态 0-显示 1-隐藏' },
        mid: { type: DataTypes.STRING(5), comment: '栏目模型id' },
        listView: { type: DataTypes.STRING(100), comment: '栏目列表页模板' },
        articleView: { type: DataTypes.STRING(100), comment: '详情页模板' },
    },
    {
        sequelize,
        tableName: 'cms_category',  // 指定表名
        comment: '栏目表'  // 表注释
    }
);
module.exports = Category;