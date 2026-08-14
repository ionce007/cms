const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');

class Frag extends Model { }

Frag.init(
    {
        id: {
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: 'ID，关键字串类型，自动递增',
        },
        name: { type: DataTypes.STRING(50), comment: '名称' },
        mark: { type: DataTypes.STRING(50), comment: '标识' },
        content: { type: DataTypes.TEXT('medium'), comment: '内容' },  
        type: { type: DataTypes.TINYINT, comment: '类型 1-富文本 2-文本框' },
    },
    {
        sequelize,
        tableName: 'cms_frag',  // 指定表名
        comment: '碎片表'  // 表注释
    }
);
module.exports = Frag;