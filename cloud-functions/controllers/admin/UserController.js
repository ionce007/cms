// controllers/admin/SystemUserController.js
const { User, Role } = require('../../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// ==================== 角色管理 ====================

// 获取角色列表
async function getRoles(req, res) {
    try {
        const roles = await Role.findAll({ order: [['sort', 'ASC']] });
        res.json({ code: 1, data: roles });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// 创建角色
async function createRole(req, res) {
    try {
        const { name, value, sort = 0, status = 1, remark, permissions = [] } = req.body;
        await Role.create({ name, value, sort, status, remark, permissions });
        res.json({ code: 1, message: '角色创建成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// 更新角色
async function updateRole(req, res) {
    try {
        const { id } = req.params;
        const { name, value, sort, status, remark, permissions = [] } = req.body;
        const role = await Role.findByPk(id);
        if (role.value === 'super') return res.json({ code: -1, message: '内置管理员不可修改' });

        await role.update({ name, value, sort, status, remark, permissions });
        res.json({ code: 1, message: '角色更新成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// 删除角色
async function deleteRole(req, res) {
    try {
        const { id } = req.params;
        const role = await Role.findByPk(id);
        if (!role) return res.json({ code: -1, message: '角色不存在' });
        if (role.value === 'super') return res.json({ code: -1, message: '内置超级管理员角色不可删除' });

        // 检查该角色下是否有用户
        const userCount = await User.count({ where: { role_id: id } });
        if (userCount > 0) return res.json({ code: -1, message: '该角色下存在用户，无法删除' });

        await role.destroy();
        res.json({ code: 1, message: '角色删除成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// ==================== 系统用户管理 ====================

// 获取系统用户列表
async function getUsers(req, res) {
    try {
        const { page = 1, limit = 10, keyword, role_id } = req.query;
        const where = {};
        if (keyword) where.username = { [Op.like]: `%${keyword}%` };
        if (role_id) where.role_id = role_id;

        const { count, rows } = await User.findAndCountAll({
            where,
            include: [{ model: Role, attributes: ['id', 'name', 'value'] }],
            order: [['id', 'DESC']],
            limit: parseInt(limit),
            offset: (page - 1) * limit,
        });

        const data = rows.map(item => {
            const plain = item.get({ plain: true });
            delete plain.password; // 隐藏密码
            return plain;
        });

        res.json({ code: 1, data, total: count });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// 创建系统用户
async function createUser(req, res) {
    try {
        const { username, password, role_id, status = 1, remark } = req.body;
        if (!username || !password || !role_id) return res.json({ code: -1, message: '缺少必填项' });

        const exist = await User.findOne({ where: { username } });
        if (exist) return res.json({ code: -1, message: '用户名已存在' });

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({ username, password: hashedPassword, role_id, status, remark });
        res.json({ code: 1, message: '用户创建成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// 更新系统用户
async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const { password, role_id, status, remark } = req.body;

        const user = await User.findByPk(id);
        if (!user) return res.json({ code: -1, message: '用户不存在' });

        const updateData = { role_id, status, remark };
        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await user.update(updateData);
        res.json({ code: 1, message: '用户更新成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// 删除系统用户
async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) return res.json({ code: -1, message: '用户不存在' });

        if (user.id === 1) return res.json({ code: -1, message: '超级管理员不可删除' });
        if (user.username === 'super') return res.json({ code: -1, message: '内置管理员不可删除' });

        await user.destroy();
        res.json({ code: 1, message: '用户删除成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

module.exports = {
    getRoles, createRole, updateRole, deleteRole,
    getUsers, createUser, updateUser, deleteUser
};