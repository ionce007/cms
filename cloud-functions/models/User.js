const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');
const Role = require('./Role');

class User extends Model { }

User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '用户ID'
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {              // 数据库外键约束
            model: 'sys_role',          // 目标表
            key: 'id'                // 目标字段
        },
        comment: '角色ID'
    },
    username: { type: DataTypes.STRING(50), comment: '用户名称' },
    password: { type: DataTypes.STRING, comment: '用户密码' },
    status: { type: DataTypes.INTEGER, comment: '用户状态，1-启用，0-禁用' },
    remark: { type: DataTypes.STRING(255), comment: '备注' },
}, {
    sequelize,
    tableName: 'sys_user',
    comment: '系统用户表'
});
User.belongsTo(Role, { foreignKey: 'role_id' });
module.exports = User;