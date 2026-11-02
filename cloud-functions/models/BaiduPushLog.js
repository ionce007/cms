const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');

class BaiduPushLog extends Model { }

BaiduPushLog.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: 'ID，关键字串类型，自动递增',
        },
        title: { type: DataTypes.STRING(100), comment: '标题' },
        targetId: { type: DataTypes.STRING(60), comment: '目标ID' },
        url: { type: DataTypes.STRING(500), allowNull: false, comment: '推送的URL' },
        mark: { type: DataTypes.STRING(50), comment: '标识' },
        status: { type: DataTypes.TINYINT, comment: '状态 1-成功 2-失败' },
        result: { type: DataTypes.TEXT('medium'), comment: '返回结果' },
    },
    {
        sequelize,
        tableName: 'sys_baidu_push_log',  // 指定表名
        omitNull: true, // ✅ 加在这里：忽略 null 值的字段
        comment: '百度推送日志表'  // 表注释
    }
);
module.exports = BaiduPushLog;