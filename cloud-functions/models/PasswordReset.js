// models/PasswordReset.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');

class PasswordReset extends Model { }

PasswordReset.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '用户 ID',
        },
        token: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            comment: '重置令牌',
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: '过期时间',
        },
        used: {
            type: DataTypes.TINYINT,
            defaultValue: 0,
            comment: '0-未使用 1-已使用',
        },
    },
    {
        sequelize,
        timestamps: true,
        tableName: 'cms_resetPwd',
        comment: '密码重置记录表',
    }
);

module.exports = PasswordReset;