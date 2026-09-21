const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');

class Role extends Model { }

Role.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: '角色ID'
    },
    name: { type: DataTypes.STRING(50), allowNull: false, comment: '角色名称' },
    value: { type: DataTypes.STRING(50), comment: '角色值' },
    sort: { type: DataTypes.INTEGER, comment: '排序' },
    status: { type: DataTypes.INTEGER, comment: '角色状态，1-启用，0-禁用' },
    remark: { type: DataTypes.STRING(255), comment: '备注' },
}, {
    sequelize,
    tableName: 'sys_role'
});
module.exports = Role;