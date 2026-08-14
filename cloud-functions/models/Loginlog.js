const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');

class Loginlog extends Model { }

Loginlog.init(
    {
        id: {
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: 'ID，关键字串类型，自动递增',
        },
        uid: { type: DataTypes.INTEGER, comment: '用户ID' },
        ip: { type: DataTypes.STRING(50), comment: '登录IP' },
        country: { type: DataTypes.STRING(255), comment: '登录地址' },
        prov: { type: DataTypes.STRING(50), comment: '省份' },
        city: { type: DataTypes.STRING(50), comment: '城市' },
        district: { type: DataTypes.STRING, comment: '地区' },
        isp: { type: DataTypes.STRING(255), comment: '网络提供商' },
        lat: { type: DataTypes.STRING(50), comment: '纬度' },
        lng: { type: DataTypes.STRING(50), comment: '经度' },
    },
    {
        sequelize,
        tableName: 'cms_loginlog',  // 指定表名
        comment: '登录日志表'  // 表注释
    }
);

module.exports = Loginlog;