const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');

class VisitLog extends Model { }

VisitLog.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: 'ID，关键字串类型，自动递增',
        },
        memberId: { type: DataTypes.INTEGER, comment: '会员ID，会员未登录时为空' },
        memberName:{type: DataTypes.STRING(120), comment: '会员名称/昵称，会员未登录时为空'},
        logType: { type: DataTypes.STRING(300), comment: '操作类型' },
        page:{type: DataTypes.STRING(300), comment: '文章页面'},
        ip: { type: DataTypes.STRING(50), comment: '访问者IP' },
        osName:{ type: DataTypes.STRING(50), comment: '访问者操作系统' },
        browser:{ type: DataTypes.STRING(50), comment: '访问者浏览器名称' },
        device:{ type: DataTypes.STRING(50), comment: '访问者设备名称' },
        prov: { type: DataTypes.STRING(50), comment: '省份' },
        city: { type: DataTypes.STRING(50), comment: '城市' },
        district: { type: DataTypes.STRING, comment: '地区' },
        isp: { type: DataTypes.STRING(255), comment: '网络提供商' },
        lat: { type: DataTypes.STRING(50), comment: '纬度' },
        lng: { type: DataTypes.STRING(50), comment: '经度' },
    },
    {
        sequelize,
        tableName: 'cms_visitlog',  // 指定表名
        timestamps: true,
        indexes: [
            { fields: ['memberId'] },
            { fields: ['page'] },
            { fields: ['createdAt'] }
        ],
        comment: '浏览日志表'  // 表注释
    }
);

module.exports = VisitLog;