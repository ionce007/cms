// models/Comment.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');

class Comment extends Model { }

Comment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: '评论 ID，关键字'
        },
        // ✅ 评论对象
        targetType: {
            type: DataTypes.STRING(20),
            allowNull: false,
            comment: 'article / formula',
        },
        targetId: {
            type: DataTypes.STRING(60),
            allowNull: false,
            comment: '目标 ID',
        },
        // ✅ 会员 ID（匿名评论 null）
        memberId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: '会员 ID（匿名评论 null）',
        },
        // ✅ 昵称（匿名必填）
        nickname: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: '昵称（匿名必填）',
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: '评论者头像',
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: '评论者Email',
        },
        // ✅ 评论内容
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: '评论内容',
        },
        // ✅ 父评论 ID（一级评论为 null）
        parentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: '父评论 ID',
        },
        // ✅ 层级路径（如 "1.5.12"，方便按层级查询）
        path: {
            type: DataTypes.STRING(500),
            allowNull: false,
            defaultValue: '',
            comment: '层级路径，用点号分隔',
        },
        // ✅ 层级深度（1 = 一级评论）
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            comment: '评论层级',
        },
        // ✅ 直接回复数
        replyCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: '直接回复数',
        },
        // ✅ 点赞数
        likes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: '点赞数',
        },
        // ✅ 审核状态
        status: {
            type: DataTypes.TINYINT,
            defaultValue: 0,
            comment: '0-通过 1-待审核 2-已拒绝',
        },
        // ✅ 被回复者昵称（用于显示"回复 XXX"）
        replyTo: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: '被回复者昵称（用于显示"回复 XXX"）',
        },
        // ✅ IP 防刷
        ip: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'IP 防刷',
        },
        userAgent: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: '评论者 User Agent',
        },
    },
    {
        sequelize,
        timestamps: true,
        tableName: 'cms_comment',
        comment: '评论表',
        indexes: [
            {
                fields: ['targetType', 'targetId'],
                name: 'idx_target',
            },
            {
                fields: ['memberId'],
                name: 'idx_member',
            },
            {
                fields: ['parentId'],
                name: 'idx_parent',
            },
            {
                fields: ['path'],
                name: 'idx_path',
            },
        ],
    }
);

module.exports = Comment;