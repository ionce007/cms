// controllers/MemberController.js
const Member = require('../models/Member');
const { generateToken } = require('../common/jwt');
const { Op } = require('sequelize');
const PasswordReset = require('../models/PasswordReset');
const { sendPasswordResetEmail } = require('../common/mailer');
const crypto = require('crypto');

const TOKEN_EXPIRE_MINUTES = 30;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8088';
/**
 * 用户注册
 * POST /api/member/register
 */
async function register(req, res) {
    try {
        const { username, email, password, nickname } = req.body;

        // ✅ 参数校验
        if (!username || !password) {
            return res.json({ code: -1, message: '用户名和密码不能为空', });
        }

        if (username.length < 3 || username.length > 20) {
            return res.json({ code: -1, message: '用户名长度 3-20 位', });
        }

        if (password.length < 6) {
            return res.json({ code: -1, message: '密码至少 6 位', });
        }

        // ✅ 检查是否已存在
        const where = { username };
        if (email) {
            where[Op.or] = [{ username }, { email }];
        }

        const existing = await Member.findOne({ where });

        if (existing) {
            return res.json({ code: -1, message: existing.username === username ? '用户名已存在' : '邮箱已被注册', });
        }

        // ✅ 创建用户
        const member = await Member.create({
            username,
            email: email || null,
            password,
            nickname: nickname || username,
        });

        // ✅ 生成 Token
        const token = generateToken({ id: member.id, username: member.username, role: member.role, });

        res.json({
            code: 1, message: '注册成功', data: { token, user: { id: member.id, username: member.username, nickname: member.nickname, avatar: member.avatar, role: member.role, }, },
        });
    } catch (error) {
        console.error('register error:', error);
        res.json({ code: -1, message: error.message, });
    }
}

/**
 * 用户登录
 * POST /api/member/login
 */
async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.json({ code: -1, message: '用户名和密码不能为空', });
        }

        // ✅ 查找用户（支持用户名或邮箱）
        const member = await Member.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { email: username },
                ],
            },
        });

        if (!member) {
            return res.json({ code: -1, message: '用户名或密码错误', });
        }

        if (member.status !== 0) {
            return res.json({ code: -1, message: '账号已被禁用', });
        }

        // ✅ 验证密码
        const isValid = await member.validatePassword(password);

        if (!isValid) {
            return res.json({ code: -1, message: '用户名或密码错误', });
        }

        // ✅ 更新最后登录时间
        await member.update({ lastLoginAt: new Date() });

        // ✅ 生成 Token
        const token = generateToken({
            id: member.id,
            username: member.username,
            role: member.role,
        });

        res.json({
            code: 1,
            message: '登录成功',
            data: {
                token,
                user: {
                    id: member.id,
                    username: member.username,
                    nickname: member.nickname,
                    avatar: member.avatar,
                    role: member.role,
                    vipExpireAt: member.vipExpireAt,
                },
            },
        });
    } catch (error) {
        console.error('login error:', error);
        res.json({ code: -1, message: error.message, });
    }
}

/**
 * 获取当前用户信息
 * GET /api/member/me
 */
async function getMe(req, res) {
    try {
        if (!req.user) {
            return res.json({ code: -1, message: '未登录', });
        }

        res.json({
            code: 1,
            message: 'success',
            data: {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email,
                nickname: req.user.nickname,
                avatar: req.user.avatar,
                role: req.user.role,
                vipExpireAt: req.user.vipExpireAt,
                lastLoginAt: req.user.lastLoginAt,
            },
        });
    } catch (error) {
        res.json({
            code: -1,
            message: error.message,
        });
    }
}

/**
 * 更新用户信息
 * PUT /api/member/me
 */
async function updateMe(req, res) {
    try {
        const { nickname, avatar, email } = req.body;

        const updateData = {};
        if (nickname) updateData.nickname = nickname;
        if (avatar) updateData.avatar = avatar;
        if (email) updateData.email = email;

        await req.user.update(updateData);

        res.json({
            code: 1,
            message: '更新成功',
            data: {
                id: req.user.id,
                username: req.user.username,
                nickname: req.user.nickname,
                avatar: req.user.avatar,
                email: req.user.email,
            },
        });
    } catch (error) {
        res.json({
            code: -1,
            message: error.message,
        });
    }
}

/**
 * 修改密码
 * PUT /api/member/password
 */
async function changePassword(req, res) {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.json({
                code: -1,
                message: '请填写完整',
            });
        }

        if (newPassword.length < 6) {
            return res.json({
                code: -1,
                message: '新密码至少 6 位',
            });
        }

        const isValid = await req.user.validatePassword(oldPassword);
        if (!isValid) {
            return res.json({
                code: -1,
                message: '原密码错误',
            });
        }

        await req.user.update({ password: newPassword });

        res.json({
            code: 1,
            message: '密码修改成功',
        });
    } catch (error) {
        res.json({
            code: -1,
            message: error.message,
        });
    }
}

/**
 * 请求密码重置
 * POST /api/member/forgot-password
 * 
 * Body: { email: string }
 */
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({ code: -1, message: '请输入邮箱', });
        }

        // ✅ 查找用户（限制 1 分钟一次）
        const member = await Member.findOne({
            where: {
                [Op.or]: [
                    { email },
                    { username: email },
                ],
            },
        });

        // ✅ 安全考虑：无论用户是否存在，都返回成功信息
        // 避免攻击者通过响应差异探测邮箱是否存在
        if (!member) {
            return res.json({ code: 1, message: '如果该账号存在，重置邮件已发送至您的邮箱', });
        }

        if (member.status !== 0) {
            return res.json({ code: -1, message: '账号已被禁用', });
        }

        // ✅ 检查是否有未过期的重置记录
        const existing = await PasswordReset.findOne({
            where: {
                userId: member.id,
                used: 0,
                expiresAt: { [Op.gt]: new Date() },
            },
            order: [['createdAt', 'DESC']],
        });

        // ✅ 1 分钟内不能重复请求
        if (existing) {
            const diff = Date.now() - new Date(existing.createdAt).getTime();
            if (diff < 60 * 1000) {
                return res.json({ code: -1, message: '请求过于频繁，请 1 分钟后再试', });
            }
        }

        // ✅ 生成重置令牌
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + TOKEN_EXPIRE_MINUTES * 60 * 1000);

        // ✅ 作废之前的令牌
        await PasswordReset.update(
            { used: 1 },
            {
                where: {
                    userId: member.id,
                    used: 0,
                },
            }
        );

        // ✅ 创建新的重置记录
        await PasswordReset.create({
            userId: member.id,
            token,
            expiresAt,
        });

        // ✅ 生成重置链接
        const resetUrl = `${SITE_URL}/resetpwd?token=${token}`;

        // ✅ 发送邮件
        const mailResult = await sendPasswordResetEmail({
            to: member.email || email,
            username: member.nickname || member.username,
            resetUrl,
            expireMinutes: TOKEN_EXPIRE_MINUTES,
        });

        if (!mailResult.success) {
            console.error('邮件发送失败:', mailResult.error);
            return res.json({ code: -1, message: '邮件发送失败，请稍后重试', });
        }

        res.json({ code: 1, message: `重置邮件已发送，请在 ${TOKEN_EXPIRE_MINUTES} 分钟内完成操作`, });
    } catch (error) {
        console.error('forgotPassword error:', error);
        res.json({ code: -1, message: error.message, });
    }
}
/**
 * 验证重置令牌是否有效
 * GET /api/member/verify-reset-token?token=xxx
 */
async function verifyResetToken(req, res) {
    try {
        const { token } = req.query;

        if (!token) {
            return res.json({ code: -1, message: '缺少令牌', });
        }

        const record = await PasswordReset.findOne({
            where: { token },
            include: [{ model: Member, attributes: ['id', 'username', 'email'] }],
        });

        if (!record) {
            return res.json({ code: -1, message: '无效的令牌', });
        }

        if (record.used) {
            return res.json({ code: -1, message: '该令牌已被使用', });
        }

        if (new Date(record.expiresAt) < new Date()) {
            return res.json({ code: -1, message: '令牌已过期，请重新申请', });
        }

        res.json({ code: 1, message: '令牌有效', data: { username: record.Member?.username, email: record.Member?.email, }, });
    } catch (error) {
        res.json({ code: -1, message: error.message, });
    }
}

/**
 * 重置密码
 * POST /api/member/reset-password
 * 
 * Body: { token: string, password: string }
 */
async function resetPassword(req, res) {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.json({
                code: -1,
                message: '参数不完整',
            });
        }

        if (password.length < 6) {
            return res.json({
                code: -1,
                message: '密码至少 6 位',
            });
        }

        // ✅ 查找令牌记录
        const record = await PasswordReset.findOne({
            where: { token },
            include: [{ model: Member }],
        });

        if (!record) {
            return res.json({ code: -1, message: '无效的令牌', });
        }

        if (record.used) {
            return res.json({ code: -1, message: '该令牌已被使用', });
        }

        if (new Date(record.expiresAt) < new Date()) {
            return res.json({ code: -1, message: '令牌已过期，请重新申请', });
        }

        const member = record.Member;
        if (!member || member.status !== 0) {
            return res.json({ code: -1, message: '用户不存在或已被禁用', });
        }

        // ✅ 更新密码（beforeUpdate 会自动加密）
        await member.update({ password });

        // ✅ 标记令牌已使用
        await record.update({ used: 1 });

        // ✅ 可选：发送通知邮件
        // await sendMail({ to: member.email, subject: '密码已修改', ... });

        res.json({ code: 1, message: '密码重置成功，请使用新密码登录', });
    } catch (error) {
        console.error('resetPassword error:', error);
        res.json({ code: -1, message: error.message, });
    }
}
async function getMyBookmarks(req, res) {
    const { targetType } = req.query;

    const bookmarks = await UserBookmark.findAll({
        where: {
            userId: req.user.id,
            ...(targetType ? { targetType } : {}),
        },
        order: [['createdAt', 'DESC']],
    });

    // 根据 targetType 查询详情
    const results = await Promise.all(
        bookmarks.map(async (bm) => {
            if (bm.targetType === 'article') {
                const article = await Article.findByPk(bm.targetId);
                return { ...bm.toJSON(), article };
            } else {
                const formula = await Formula.findOne({
                    where: { fs_id: bm.targetId },
                });
                return { ...bm.toJSON(), formula };
            }
        })
    );

    res.json({ code: 1, data: results });
}
module.exports = {
    register,
    login,
    getMe,
    updateMe,
    changePassword,
    forgotPassword,
    verifyResetToken,
    resetPassword,
    getMyBookmarks,
};