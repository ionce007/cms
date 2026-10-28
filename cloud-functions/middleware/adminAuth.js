// middlewares/adminAuth.js
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

async function requireAdmin(req, res, next) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ code: -1, message: '未登录' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        /*const user = await User.findByPk(decoded.id, {
            include: [{ model: Role }]
        });*/
        // ✅ 查询管理员，并包含角色及权限
        const user = await User.findByPk(decoded.id, {
            include: [{ model: Role, attributes: ['id', 'name', 'value', 'permissions'] }]
        });
        if (!user || user.status !== 1) {
            return res.status(403).json({ code: -1, message: '无权访问或账号已禁用' });
        }

        req.admin = user;
        next();
    } catch (err) {
        return res.status(401).json({ code: -1, message: '登录已过期' });
    }
}

module.exports = { requireAdmin };