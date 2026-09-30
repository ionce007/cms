const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');

class Token extends Model { }

Token.init(
    {
        supplier: {
            type: DataTypes.STRING(60),
            defaultValue: 'baidupan',
            primaryKey: true,
            comment: '第三应用供应商识别',
        },
        access_token: { type: DataTypes.TEXT, comment: 'access_token值' },
        expires_in: { type: DataTypes.INTEGER, comment: 'Access Token的有效期，单位为秒。' },
        refresh_token: { type: DataTypes.STRING(600), comment: '用于刷新 Access Token, baidupan有效期为10年。' },
        scope: { type: DataTypes.STRING(500), comment: 'Access Token 最终的访问权限，即用户的实际授权列表。' },
        remark: { type: DataTypes.STRING, comment: '备注及说明' },
        spare: { type: DataTypes.STRING, comment: '备用字段' },
    },
    {
        sequelize,
        tableName: 'cms_apptoken',  // 指定表名
        comment: '第三方应用token记录表'  // 表注释
    }
);
module.exports = Token;