// controllers/MemberController.js
import sequelize from '../common/db';  // 导入 sequelize 实例
const { Article, Formula, Member, MemberLike, MemberBookmark, MemberDownload, Comment } = require('../models');
const { generateToken } = require('../common/jwt');
const { Op } = require('sequelize');
const PasswordReset = require('../models/PasswordReset');
const { sendPasswordResetEmail } = require('../common/mailer');
const crypto = require('crypto');

const { SITE_URL } = require('../../config/env')

const TOKEN_EXPIRE_MINUTES = 30;
//const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8088';
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

/**
 * 获取我的点赞列表（支持 article + formula）
 * GET /api/member/likes?page=1&limit=12&targetType=all
 */
async function getMyLikes(req, res, next) {
    try {
        const userId = req.user ? req.user.toJSON().id : null;
        const { targetType, page = 1, limit = 10 } = req.query;

        const where = { memberId: userId };
        if (targetType && targetType !== 'all') where.targetType = targetType;

        const { count, rows } = await MemberLike.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });

        // ✅ 批量查询详情
        const data = await enrichWithDetails(rows);

        res.json({ code: 1, count, data });
    } catch (error) {
        console.error('getMyLikes error:', error);
        res.json({ code: -1, message: error.message });
    }
}
/**
 * 获取我的收藏列表（支持 article + formula）
 * GET /api/member/bookmarks?page=1&limit=12&targetType=all
 */
async function getMyBookmarks(req, res, next) {
    try {
        const userId = req.user ? req.user.toJSON().id : null;
        const { targetType, page = 1, limit = 10 } = req.query;

        const where = { memberId: userId };
        if (targetType && targetType !== 'all') where.targetType = targetType;

        const { count, rows } = await MemberBookmark.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });

        const data = await enrichWithDetails(rows);

        res.json({ code: 1, count, data });
    } catch (error) {
        console.error('getMyBookmarks error:', error);
        res.json({ code: -1, message: error.message });
    }
}
// ================================================================
// 7. 我的下载列表
// ================================================================
async function getMyDownloads(req, res, next) {
    try {
        const userId = req.user ? req.user.toJSON().id : null;
        const { page = 1, limit = 10 } = req.query;

        const { count, rows } = await MemberDownload.findAndCountAll({
            where: { memberId: userId },
            order: [['lastDownloadAt', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });

        const data = await enrichWithDetails(rows);

        res.json({ code: 1, count, data });
    } catch (error) {
        console.error('getMyDownloads error:', error);
        res.json({ code: -1, message: error.message });
    }
}

/**
 * 辅助函数：批量查询详情
 */
async function enrichWithDetails(records) {
    const articleIds = records
        .filter(r => r.targetType === 'article')
        .map(r => r.targetId);

    const formulaIds = records
        .filter(r => r.targetType === 'formula')
        .map(r => r.targetId);

    const [articles, formulas] = await Promise.all([
        articleIds.length
            ? Article.findAll({
                where: { id: articleIds },
                attributes: ['id', 'title', 'img', 'description', 'pv', 'likes', 'marked'],
            })
            : [],
        formulaIds.length
            ? Formula.findAll({
                where: { fs_id: formulaIds },
                attributes: ['fs_id', 'server_filename', 'img', 'summary', 'size', 'price', 'views', 'likes', 'marked'],
            })
            : [],
    ]);

    const articleMap = {};
    articles.forEach(a => { articleMap[a.id] = a; });

    const formulaMap = {};
    formulas.forEach(f => { formulaMap[f.fs_id] = f; });

    return records.map(record => {
        const plain = record.get ? record.get({ plain: true }) : record;

        return {
            id: plain.id,
            targetType: plain.targetType,
            targetId: plain.targetId,
            content: plain.content ? plain.content : '',
            createdAt: plain.createdAt,
            lastDownloadAt: plain.lastDownloadAt,
            downloadCount: plain.downloadCount,
            // ✅ 关联详情
            article: plain.targetType === 'article' ? articleMap[plain.targetId] : null,
            formula: plain.targetType === 'formula' ? formulaMap[plain.targetId] : null,
        };
    });
}
/**
 * ✅ 批量获取 formula 信息（从 cms_formula 表）
 * @param {string[]} ids - formula ID 数组
 * @returns {Map<string, { id, title, fileSize, img, downloadUrl, description }>}
 */
async function batchLoadFormulas(ids) {
    if (!ids || ids.length === 0) return new Map();

    const cleanIds = ids
        .map(id => String(id))
        .filter(id => /^\d+$/.test(id))
        .map(id => parseInt(id));

    if (cleanIds.length === 0) return new Map();

    try {
        const rows = await sequelize.query(
            `SELECT id, title, file_size AS fileSize, img, download_url AS downloadUrl, description
       FROM cms_formula
       WHERE id IN (:ids)`,
            {
                replacements: { ids: cleanIds },
                type: QueryTypes.SELECT,
            }
        );

        const map = new Map();
        rows.forEach(r => map.set(String(r.id), r));
        return map;
    } catch (err) {
        console.error('batchLoadFormulas error:', err);
        return new Map();
    }
}
// ================================================================
// 1. 获取会员中心统计
//    GET /api/member/stats
// ================================================================
async function getMemberStats(req, res, next) {
    try {
        const memberId = req.user ? req.user.toJSON().id : null;

        if (!memberId) {
            return res.json({ code: -1, message: '未登录', data: null });
        }
        const [comments, likes, favorites, downloads] = await Promise.all([
            // 评论数：status = 0（通过）
            Comment.count({ where: { memberId, status: 0 } }),

            // 点赞数
            MemberLike.count({ where: { memberId } }),

            // 收藏数
            MemberBookmark.count({ where: { memberId } }),

            // 下载数：按 targetType + targetId 去重
            MemberDownload.count({
                where: { memberId },
                distinct: true,
                col: 'targetId',
            }),
        ]);

        res.json({
            code: 1,
            message: '获取成功',
            data: { comments, likes, favorites, downloads },
        });

    } catch (error) {
        console.error('getMemberStats error:', error);
        res.json({
            code: -1,
            message: error.message || '获取失败',
            data: { comments: 0, likes: 0, favorites: 0, downloads: 0 },
        });
    }
}

// ================================================================
// 2. ✅ 获取会员资料（根据实际字段更正）
//    GET /api/member/profile
// ================================================================
async function getMemberProfile(req, res, next) {
    try {
        const memberId = req.user ? req.user.toJSON().id : null;

        if (!memberId) {
            return res.json({ code: -1, message: '未登录', data: null });
        }

        // ✅ 只查询实际存在的字段
        const member = await Member.findByPk(memberId, {
            attributes: [
                'id',
                'username',
                'email',
                'nickname',
                'avatar',
                'role',
                'vipExpireAt',
                'status',
                'lastLoginAt',
                'createdAt',
            ],
        });

        if (!member) {
            return res.json({ code: -1, message: '用户不存在', data: null });
        }

        // ✅ 判断 VIP：role === 'vip' 且 vipExpireAt 未过期
        const now = new Date();
        const isVip =
            member.role === 'vip' &&
            member.vipExpireAt &&
            new Date(member.vipExpireAt) > now;

        // ✅ 计算等级标签
        let levelLabel = '普通会员';
        if (member.role === 'super') levelLabel = '管理员';
        else if (isVip) levelLabel = 'VIP会员';
        else if (member.role === 'vip') levelLabel = 'VIP已过期';

        res.json({
            code: 1,
            message: '获取成功',
            data: {
                id: member.id,
                username: member.username,
                nickname: member.nickname || member.username || '匿名用户',
                email: member.email || '',
                avatar: member.avatar || '/img/avatar-default-member.jpg',
                role: member.role,
                isVip,
                level: levelLabel,
                vipExpireAt: member.vipExpireAt,
                lastLoginAt: member.lastLoginAt,
                createdAt: member.createdAt,
            },
        });
    } catch (error) {
        console.error('getMemberProfile error:', error);
        res.json({ code: -1, message: error.message || '获取失败', data: null });
    }
}

/**
 * 获取我的评论列表（支持 article + formula）
 * GET /api/member/comments?page=1&limit=10&targetType=all
 */
async function getMyComments(req, res, next) {
    try {
        const memberId = req.user ? req.user.toJSON().id : null;
        const {
            page = 1,
            limit = 10,
            targetType = 'all',
        } = req.query;

        if (!memberId) {
            return res.json({ code: -1, message: '未登录', data: [], count: 0 });
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;

        // ✅ 构建 where（注意 status 排除已拒绝）
        const where = {
            memberId,
            status: { [Op.ne]: 2 },
        };
        if (targetType && targetType !== 'all') {
            where.targetType = targetType;
        }

        const { count, rows } = await Comment.findAndCountAll({
            where,
            limit: limitNum,
            offset,
            order: [['createdAt', 'DESC']],
        });
        const data = await enrichWithDetails(rows);

        /*        
                // ✅ 分离 + 批量加载
                const articleIds = rows
                    .filter(r => r.targetType === 'article')
                    .map(r => r.targetId);
                const formulaIds = rows
                    .filter(r => r.targetType === 'formula')
                    .map(r => r.targetId);
        
                const [articles, formulaMap] = await Promise.all([
                    articleIds.length > 0
                        ? Article.findAll({
                            where: { id: { [Op.in]: articleIds } },
                            attributes: ['id', 'title', 'img'],
                            raw: true,
                        })
                        : [],
                    batchLoadFormulas(formulaIds),
                ]);
        
                const articleMap = new Map(articles.map(a => [String(a.id), a]));
        
                const data = rows.map(item => {
                    const plain = item.get({ plain: true });
                    const tid = String(plain.targetId);
        
                    let targetTitle = '目标已删除';
                    let targetCover = '';
                    let targetUrl = '';
        
                    if (plain.targetType === 'article') {
                        const a = articleMap.get(tid);
                        if (a) {
                            targetTitle = a.title;
                            targetCover = a.img || '';
                            targetUrl = `/articles/${a.id}`;
                        }
                    } else if (plain.targetType === 'formula') {
                        const f = formulaMap.get(tid);
                        if (f) {
                            targetTitle = f.title || `公式 #${f.id}`;
                            targetCover = f.img || '';
                            targetUrl = `/formulas/${f.id}`;
                        }
                    }
        
                    return {
                        id: plain.id,
                        targetType: plain.targetType,       // ✅ 前端用于显示类型标签
                        targetId: plain.targetId,
                        targetTitle,
                        targetCover,
                        targetUrl,
                        content: plain.content,             // ✅ 保留 HTML
                        createdAt: plain.createdAt
                            ? new Date(plain.createdAt).toLocaleString('zh-CN')
                            : '',
                        likes: plain.likes || 0,
                        status: plain.status,
                    };
                });
        */
        res.json({ code: 1, message: '获取成功', count, data });
    } catch (error) {
        console.error('getMyComments error:', error);
        res.json({
            code: -1,
            message: error.message || '获取失败',
            data: [],
            count: 0,
        });
    }
}

// ================================================================
// 4. 删除我的评论（软删除 status = 2）
// ================================================================
async function deleteMyComment(req, res, next) {
    try {
        const memberId = req.user ? req.user.toJSON().id : null;
        const { id } = req.params;

        if (!memberId) {
            return res.json({ code: -1, message: '未登录' });
        }

        const comment = await Comment.findOne({ where: { id, memberId } });
        if (!comment) {
            return res.json({ code: -1, message: '评论不存在或无权删除' });
        }

        await comment.update({ status: 2 });

        res.json({ code: 1, message: '删除成功' });
    } catch (error) {
        console.error('deleteMyComment error:', error);
        res.json({ code: -1, message: error.message || '删除失败' });
    }
}
// ================================================================
// 9. ✅ 更新个人资料（根据实际字段更正）
//    PUT /api/member/profile
// ================================================================
async function updateMemberProfile(req, res, next) {
    try {
        const memberId = req.user ? req.user.toJSON().id : null;
        const { nickname, avatar } = req.body;

        if (!memberId) {
            return res.json({ code: -1, message: '未登录' });
        }

        const member = await Member.findByPk(memberId);
        if (!member) {
            return res.json({ code: -1, message: '用户不存在' });
        }

        // ✅ Member 表只有 nickname 和 avatar 可改
        // username 唯一，一般不允许修改
        // email 唯一，需要单独的修改邮箱流程（发送验证邮件）
        // bio 字段不存在于 Member 表，忽略
        const updateData = {};
        if (nickname !== undefined && nickname.trim()) {
            updateData.nickname = nickname.trim();
        }
        if (avatar !== undefined) {
            updateData.avatar = avatar;
        }

        if (Object.keys(updateData).length === 0) {
            return res.json({ code: -1, message: '没有需要更新的字段' });
        }

        await member.update(updateData);

        res.json({ code: 1, message: '保存成功' });
    } catch (error) {
        console.error('updateMemberProfile error:', error);
        res.json({ code: -1, message: error.message || '保存失败' });
    }
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
    getMyLikes,
    getMyBookmarks,
    getMyDownloads,
    getMemberStats,
    getMemberProfile,
    getMyComments,
    deleteMyComment,
    updateMemberProfile,
};