const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');

class Slide extends Model { }

Slide.init(
    {
        id: {
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.INTEGER,
            autoIncrement: true, 
            primaryKey: true,
            comment: 'ID，关键字串类型，自动递增',
        },
        title: { type: DataTypes.STRING(255), comment: '轮播图标题' },
        imgUrl: { type: DataTypes.STRING(255), comment: '轮播图图片' },
        linkUrl: { type: DataTypes.STRING(100), comment: '轮播图链接' }, 
        mark: { type: DataTypes.STRING(255), comment: '轮播图备注' },
    },
    {
        sequelize,
        tableName: 'cms_slide',  // 指定表名
        comment: '网站轮播图'  // 表注释
    }
);
module.exports = Slide;