// models/UserBookmark.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');

class MemberBookmark extends Model {}

MemberBookmark.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: '主键 ID',
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '用户 ID',
            references: {
                model: 'cms_member',
                key: 'id',
            },
        },
        targetType: {
            type: DataTypes.STRING(20),
            allowNull: false,
            comment: '收藏目标类型：article / formula',
        },
        targetId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '收藏目标 ID（文章 ID 或文件 fs_id）',
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: '收藏时间',
        },
    },
    {
        sequelize,
        timestamps: true,
        updatedAt: false,  // ✅ 收藏记录不需要 updatedAt
        tableName: 'cms_user_bookmark',
        comment: '用户收藏关联表',
        indexes: [
            {
                // ✅ 唯一索引：同一用户不能重复收藏同一对象
                name: 'unique_user_target',
                unique: true,
                fields: ['userId', 'targetType', 'targetId'],
            },
            {
                // ✅ 普通索引：加快"我的收藏"查询
                name: 'idx_user',
                fields: ['userId'],
            },
            {
                // ✅ 普通索引：加快按对象查收藏用户
                name: 'idx_target',
                fields: ['targetType', 'targetId'],
            },
        ],
    }
);

module.exports = MemberBookmark;