const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');

class Message extends Model { }

Message.init(
    {
        id: {
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: 'ID，关键字串类型，自动递增',
        },
        type: { type: DataTypes.ENUM('1','2','3','4'), comment: '留言分类 1-咨询 2-建议 3-投诉 4-其它' },
        title: { type: DataTypes.STRING, comment: '留言标题' },
        name: { type: DataTypes.STRING(100), comment: '留言人姓名' },
        tel: { type: DataTypes.STRING(50), comment: '留言人电话' },
        wechat: { type: DataTypes.STRING(50), comment: '留言人微信' },
        company: { type: DataTypes.STRING(100), comment: '留言人公司' },
        content: { type: DataTypes.TEXT, comment: '留言内容' },
    },
    {
        sequelize,
        tableName: 'cms_message',// 指定表名

    }
);

module.exports = Message;
