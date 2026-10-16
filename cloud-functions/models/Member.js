// models/Member.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');
const bcrypt = require('bcryptjs');
const PasswordReset = require('./PasswordReset');

class Member extends Model {
    // ✅ 验证密码
    async validatePassword(password) {
        return bcrypt.compare(password, this.password);
    }
}

Member.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: '用户ID，关键字',
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: '会员名',
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: true,
            comment: '邮箱',
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: '密码（加密）',
        },
        nickname: {
            type: DataTypes.STRING(50),
            comment: '昵称',
        },
        avatar: {
            type: DataTypes.STRING,
            defaultValue: '/img/avatar-default-member.jpg',
            comment: '头像',
        },
        role: {
            type: DataTypes.STRING(20),
            defaultValue: 'user',
            comment: '角色：user / vip / admin',
        },
        vipExpireAt: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'VIP 到期时间',
        },
        status: {
            type: DataTypes.TINYINT,
            defaultValue: 0,
            comment: '0-正常 1-禁用',
        },
        lastLoginAt: {
            type: DataTypes.DATE,
            comment: '最后登录时间',
        },
    },
    {
        sequelize,
        timestamps: true,
        tableName: 'cms_member',
        comment: '会员表',
        hooks: {
            // ✅ 创建前加密密码
            beforeCreate: async (member) => {
                if (member.password) {
                    member.password = await bcrypt.hash(member.password, 10);
                }
            },
            // ✅ 更新前加密密码
            beforeUpdate: async (member) => {
                if (member.changed('password')) {
                    member.password = await bcrypt.hash(member.password, 10);
                }
            },
        },
    }
);

// ✅ 隐藏密码字段
Member.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
};
// ✅ 建立关联,移到 index.js 中定义
/*PasswordReset.belongsTo(Member, { foreignKey: 'memberId' });
Member.hasMany(PasswordReset, { foreignKey: 'memberId' });*/

module.exports = Member;