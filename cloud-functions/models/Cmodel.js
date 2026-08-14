const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');

class Cmodel extends Model { }

Cmodel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: 'ID，关键字串类型，自动递增',
        },
        model: { type: DataTypes.STRING(10), comment: '模型名称' },
        tableName: { type: DataTypes.STRING(50), comment: '模型对应的表名' },
        status: { type: DataTypes.STRING(2), comment: '使用状态，1-开启  0-关闭' },  
        remark: { type: DataTypes.STRING(50), comment: '备注' },
    },
    {
        sequelize,
        tableName: 'cms_model',  // 指定表名
        comment: '模型字典表'  // 表注释
    }
);
module.exports = Cmodel;