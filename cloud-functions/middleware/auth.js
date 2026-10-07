// middleware/auth.js
const { verifyToken } = require('../common/jwt');
const Member = require('../models/Member');

/**
 * 必须登录
 */
async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                code: -1,
                message: '未登录',
            });
        }

        const token = authHeader.slice(7);
        const payload = verifyToken(token);

        if (!payload) {
            return res.status(401).json({
                code: -1,
                message: 'Token 无效或已过期',
            });
        }

        const user = await Member.findByPk(payload.id);

        if (!user || user.status !== 0) {
            return res.status(401).json({
                code: -1,
                message: '用户不存在或已被禁用',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            code: -1,
            message: '认证失败',
        });
    }
}

/**
 * 可选登录（有 token 则解析，没有也放行）
 */
async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.slice(7);
            const payload = verifyToken(token);

            if (payload) {
                const user = await Member.findByPk(payload.id);
                if (user && user.status === 0) {
                    req.user = user;
                }
            }
        }

        next();
    } catch {
        next();
    }
}

/**
 * 需要管理员权限
 */
async function requireAdmin(req, res, next) {
    await requireAuth(req, res, () => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                code: -1,
                message: '权限不足',
            });
        }
        next();
    });
}

module.exports = {
    requireAuth,
    optionalAuth,
    requireAdmin,
};