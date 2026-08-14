const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');

class Friendlink extends Model { }

Friendlink.init(
    {
        id: {
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: 'ID，关键字串类型，自动递增',
        },
        title: { type: DataTypes.STRING, comment: '标题' },
        link: { type: DataTypes.STRING, comment: '链接' },
        orderBy: { type: DataTypes.INTEGER(2), comment: '排序' },
    },
    {
        sequelize,
        tableName: 'cms_friendlink',  // 指定表名
        comment: '友情链接表'  // 表注释
    }
);

module.exports = Friendlink;
