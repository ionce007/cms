// models/MemberLike.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');

class MemberLike extends Model {}

MemberLike.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: '主键 ID',
        },
        memberId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '会员 ID',
            references: {
                model: 'cms_member',
                key: 'id',
            },
        },
        targetType: {
            type: DataTypes.STRING(20),
            allowNull: false,
            comment: '类型：article / formula',
        },
        targetId: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: '目标 ID',
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        timestamps: true,
        updatedAt: false,
        tableName: 'cms_member_like',
        comment: '用户点赞关联表',
        indexes: [
            {
                unique: true,
                fields: ['memberId', 'targetType', 'targetId'],
                name: 'unique_member_like',
            },
            {
                fields: ['memberId'],
                name: 'idx_like_member',
            },
        ],
    }
);

module.exports = MemberLike;