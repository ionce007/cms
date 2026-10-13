// models/UserDownload.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');

class MemberDownload extends Model {}

MemberDownload.init(
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
        downloadCount: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            comment: '下载次数（同一用户多次下载累加）',
        },
        lastDownloadAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: '最后下载时间',
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
        tableName: 'cms_member_download',
        comment: '用户下载历史表',
        indexes: [
            {
                unique: true,
                fields: ['memberId', 'targetType', 'targetId'],
                name: 'unique_member_download',
            },
            {
                fields: ['memberId'],
                name: 'idx_download_member',
            },
        ],
    }
);

module.exports = MemberDownload;