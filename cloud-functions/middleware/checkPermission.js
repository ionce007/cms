// middlewares/checkPermission.js
const { Role } = require('../models');

/**
 * 检查管理员是否有指定的操作权限
 * @param {string} moduleName 模块名（如 'articles'）
 * @param {string} actionName 操作名（如 'create'）
 */
function checkPermission(moduleName, actionName) {
    return async (req, res, next) => {
        try {
            // 前提：requireAdmin 中间件已经执行，并把管理员信息挂到了 req.admin
            const admin = req.admin;

            if (!admin) {
                return res.status(401).json({ code: -1, message: '未登录' });
            }

            // 如果角色标识是 'super'（超级管理员），直接放行
            if (admin.Role && admin.Role.value === 'super') {
                return next();
            }

            // 获取该用户的角色权限（需要在 requireAdmin 中把 Role 查出来并包含 permissions）
            // 假设 admin.Role.permissions 是一个对象：{ "articles": ["view", "create"], ... }
            const permissions = admin.Role?.permissions || {};
            const allowedActions = permissions[moduleName] || [];

            // 检查是否包含需要的操作
            if (allowedActions.includes(actionName)) {
                return next();
            }

            // 无权限
            return res.status(403).json({
                code: -1,
                message: `无权操作：缺少 ${moduleName} 模块的 ${actionName} 权限`
            });

        } catch (error) {
            console.error('权限校验失败:', error);
            return res.status(500).json({ code: -1, message: '服务器内部错误' });
        }
    };
}

module.exports = { checkPermission };