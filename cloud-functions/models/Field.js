const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');

class Field extends Model { }

Field.init(
    {
        id: {
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: 'ID，关键字串类型，自动递增',
        },
        mid: { type: DataTypes.INTEGER, comment: '模型id' },
        cname: { type: DataTypes.STRING(60), comment: '模型字段中文名称' },
        ename: { type: DataTypes.STRING(60), comment: '模型字段英文名称' },
        type: { type: DataTypes.STRING(10), comment: '表单类型： 1-单行文本	 2-多行文本  3-下拉菜单  4-单选  5-多选  6-时间和日期  7-数字' },  
        val: { type: DataTypes.STRING, comment: '字段配置 下拉菜单多选等选项配置' },
        defaultVal: { type: DataTypes.STRING, comment: '默认值' },
        orderBy: { type: DataTypes.INTEGER, comment: '字段顺序' },
        length: { type: DataTypes.INTEGER, comment: '字段长度' }
    },
    {
        sequelize,
        tableName: 'cms_field',  // 指定表名
        comment: '字段字典表'  // 表注释
    }
);
module.exports = Field;