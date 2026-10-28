const jwt = require('jsonwebtoken');
const { User, Role } = require('../../models');
const { requireAdmin } = require('../../middleware/adminAuth'); //../../middlewares/adminAuth

// ✅ 后台登录
async function login(req, res, next) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.json({ code: -1, message: '请输入用户名和密码' });
        }

        // 查找用户
        const user = await User.findOne({
            where: { username },
            include: [{ model: Role }]
        });

        if (!user) {
            return res.json({ code: -1, message: '用户名或密码错误' });
        }

        if (user.status !== 1) {
            return res.json({ code: -1, message: '账号已被禁用' });
        }

        // 密码校验（若你的项目使用了 bcrypt 加密密码，请替换为 bcrypt.compare）
        const bcrypt = require('bcryptjs');
        const isValid = await bcrypt.compare(password, user.password);
        //const isValid = password === user.password;

        if (!isValid) {
            return res.json({ code: -1, message: '用户名或密码错误' });
        }

        // 签发管理员 JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.Role?.value || 'super' },
            process.env.JWT_SECRET || 'secret-key',
            { expiresIn: '7d' } // 有效期 7 天
        );

        // 返回管理员信息（不含密码）
        const userInfo = {
            id: user.id,
            username: user.username,
            role: user.Role?.value,
            roleName: user.Role?.name,
            permissions: user.Role?.permissions || [], // ✅ 返回权限列表
        };

        res.json({
            code: 1,
            message: '登录成功',
            data: { token, user: userInfo }
        });
    } catch (err) {
        console.error('后台登录错误:', err);
        res.json({ code: -1, message: err.message });
    }
}

// ✅ 获取当前登录管理员信息
async function profile(req, res) {
    res.json({ code: 1, data: req.admin });
};

// ✅ 退出登录（JWT 是无状态的，前端清除 token 即可，这里主要用于记录日志）
async function logout(req, res, next) {
    res.json({ code: 1, message: '已退出登录' });
};

module.exports = {
    login,
    profile,
    logout,
};