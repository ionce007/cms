const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');

class Config extends Model { }

Config.init(
    {
        id: {
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.INTEGER,
            autoIncrement: true, 
            primaryKey: true,
            comment: 'ID，关键字串类型，自动递增',
        },
        template: { type: DataTypes.STRING(50), comment: 'view模板名称' },
        appid: { type: DataTypes.STRING(255), comment: '微信小程序appid' },
        secret: { type: DataTypes.STRING(255), comment: '微信小程序appsecret' },
        accessKey: { type: DataTypes.STRING(255), comment: '七牛云accessKey' },
        secretKey: { type: DataTypes.STRING(255), comment: '七牛云secretKey' },
        domain: { type: DataTypes.STRING(255), comment: '七牛云域名' },
        bucket: { type: DataTypes.STRING(255), comment: '七牛云bucket' },
        uploadWay: { type: DataTypes.STRING(255), comment: '上传方式 1-普通 2-七牛云' },
    },
    {
        sequelize,
        tableName: 'cms_config',  // 指定表名
        comment: '网站配置表'  // 表注释
    }
);
module.exports = Config;