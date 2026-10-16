// controllers/commentController.js
const { Op } = require('sequelize');
const sanitizeHtml = require('sanitize-html');
const Comment = require('../models/Comment');
const Member = require('../models/Member');
const Article = require('../models/Article');
const Formula = require('../models/Formula');

// ============================================================
// ✅ HTML 清洗配置（支持富文本 + 图片 + 表格 + 代码 + 样式）
// ============================================================
const SANITIZE_OPTIONS = {
    allowedTags: [
        // 基础文本
        'p', 'br', 'div', 'span',
        'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins', 'mark',
        'sub', 'sup',
        // 标题
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        // 列表
        'ul', 'ol', 'li',
        // 引用 / 代码
        'blockquote', 'code', 'pre',
        // 链接
        'a',
        // 图片
        'img',
        // 表格
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
        // 分隔线
        'hr',
        // 字体（execCommand 生成）
        'font',
    ],
    allowedAttributes: {
        '*': ['style', 'class', 'align'],
        a: ['href', 'target', 'rel', 'title'],
        img: ['src', 'alt', 'width', 'height', 'title', 'loading'],
        table: ['border', 'cellpadding', 'cellspacing', 'width'],
        th: ['colspan', 'rowspan', 'align', 'valign', 'width', 'height'],
        td: ['colspan', 'rowspan', 'align', 'valign', 'width', 'height'],
        font: ['color', 'face', 'size'],
        ol: ['start', 'type'],
        li: ['value'],
        pre: ['class'],
        code: ['class'],
    },
    // ✅ 允许的 URL 协议
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
        a: ['http', 'https', 'mailto', 'tel'],
        img: ['http', 'https', 'data'],
    },
    // ✅ 允许的 CSS 样式
    allowedStyles: {
        '*': {
            // 颜色
            'color': [/^#?[a-zA-Z0-9(),.\s%\-]+$/],
            'background': [/.*/],
            'background-color': [/.*/],
            // 字体
            'font-family': [/.*/],
            'font-size': [/^\d+(\.\d+)?(px|pt|em|rem|%)?$/],
            'font-weight': [/^(normal|bold|bolder|lighter|[1-9]00)$/],
            'font-style': [/^(normal|italic|oblique)$/],
            'text-decoration': [/.*/],
            // 对齐
            'text-align': [/^(left|right|center|justify)$/],
            'vertical-align': [/^(top|middle|bottom|baseline)$/],
            // 尺寸
            'width': [/^\d+(\.\d+)?(px|%|em|rem)?$/],
            'height': [/^\d+(\.\d+)?(px|%|em|rem)?$/],
            'max-width': [/.*/],
            'max-height': [/.*/],
            'min-width': [/.*/],
            'min-height': [/.*/],
            // 间距
            'margin': [/.*/],
            'margin-top': [/.*/],
            'margin-right': [/.*/],
            'margin-bottom': [/.*/],
            'margin-left': [/.*/],
            'padding': [/.*/],
            'padding-top': [/.*/],
            'padding-right': [/.*/],
            'padding-bottom': [/.*/],
            'padding-left': [/.*/],
            // 边框
            'border': [/.*/],
            'border-top': [/.*/],
            'border-right': [/.*/],
            'border-bottom': [/.*/],
            'border-left': [/.*/],
            'border-radius': [/.*/],
            'border-collapse': [/.*/],
            // 显示
            'display': [/.*/],
            'line-height': [/.*/],
            'letter-spacing': [/.*/],
            'white-space': [/.*/],
            'word-break': [/.*/],
            // 其他
            'float': [/^(left|right|none)$/],
            'opacity': [/.*/],
        },
    },
    // ✅ 允许的 class 白名单（可选）
    allowedClasses: {
        '*': ['*'],
    },
    // ✅ 转换标签
    transformTags: {
        // 所有链接加 noopener
        a: sanitizeHtml.simpleTransform('a', {
            target: '_blank',
            rel: 'noopener noreferrer nofollow',
        }),
        // 图片加 loading 和 referrerpolicy
        img: (tagName, attribs) => {
            const newAttribs = {
                ...attribs,
                loading: 'lazy',
                referrerpolicy: 'no-referrer',
            };
            // 确保 max-width
            if (!newAttribs.style) {
                newAttribs.style = 'max-width: 100%; height: auto;';
            } else if (!newAttribs.style.includes('max-width')) {
                newAttribs.style = `max-width: 100%; ${newAttribs.style}`;
            }
            return {
                tagName: 'img',
                attribs: newAttribs,
            };
        },
    },
    // ✅ 不允许非白名单标签（防止 XSS）
    disallowedTagsMode: 'discard',
    // ✅ 保留注释（可按需）
    allowedIframeHostnames: [],
    // ✅ 移除非标准属性
    parser: {
        lowerCaseTags: true,
    },
};

// ============================================================
// 获取评论列表（树形结构）
// GET /api/comments?targetType=article&targetId=1
// ============================================================
async function getComments(req, res) {
    try {
        const { targetType, targetId } = req.query;

        if (!targetType || !targetId) {
            return res.json({ code: -1, message: '缺少参数', data: [], count: 0, });
        }

        if (!['article', 'formula'].includes(targetType)) {
            return res.json({ code: -1, message: '无效的 targetType', data: [], count: 0, });
        }

        // 一次查询所有已通过的评论
        const allComments = await Comment.findAll({
            where: {
                targetType,
                targetId: targetId,
                status: 0,
            },
            order: [['createdAt', 'ASC']],
        });

        // 构建树形结构
        const commentMap = {};
        const rootComments = [];

        allComments.forEach(comment => {
            const plain = formatComment(comment);
            plain.replies = [];
            commentMap[plain.id] = plain;
        });

        allComments.forEach(comment => {
            const plain = commentMap[comment.id];
            if (comment.parentId && commentMap[comment.parentId]) {
                commentMap[comment.parentId].replies.push(plain);
            } else {
                rootComments.push(plain);
            }
        });

        // 一级评论按时间倒序
        rootComments.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        res.json({
            code: 1,
            message: 'success',
            count: allComments.length,
            data: rootComments,
        });
    } catch (error) {
        console.error('getComments error:', error);
        res.json({
            code: -1,
            message: error.message,
            data: [],
            count: 0,
        });
    }
}

// ============================================================
// 发表评论（支持匿名 + 富文本 + 图片）
// POST /api/comments
// ============================================================
async function createComment(req, res) {
    try {
        const {
            targetType,
            targetId,
            content,
            nickname,
            email,
            parentId,
        } = req.body;

        // ============ 参数校验 ============
        if (!targetType || !targetId || !content) {
            return res.json({ code: -1, message: '缺少参数' });
        }

        if (!['article', 'formula'].includes(targetType)) {
            return res.json({ code: -1, message: '无效的 targetType' });
        }

        // ============ HTML 清洗 ============
        const rawContent = String(content).trim();

        // ✅ 用白名单清洗（保留富文本）
        const cleanContent = sanitizeHtml(rawContent, SANITIZE_OPTIONS);

        // ✅ 提取纯文本用于长度校验
        const plainText = sanitizeHtml(rawContent, {
            allowedTags: [],
            allowedAttributes: {},
            allowedStyles: {},
        });

        // ✅ 判断是否为空（纯文本 + 图片都算有效内容）
        const hasImage = /<img\s+[^>]*src=["'][^"']+["']/i.test(cleanContent);
        const trimmedText = plainText.replace(/\s+/g, ' ').trim();

        if (!trimmedText && !hasImage) {
            return res.json({ code: -1, message: '评论内容不能为空' });
        }

        if (trimmedText.length > 5000) {
            return res.json({ code: -1, message: '评论内容不能超过 5000 字' });
        }

        // ============ 判断登录 ============
        const userId = req.user ? req.user.toJSON().id : null;
        let finalNickname = nickname?.trim();
        let avatar = null;

        if (userId) {
            const member = await Member.findByPk(userId);
            if (member) {
                finalNickname = member.nickname || member.username;
                avatar = member.avatar;
            }
        }

        // 匿名评论必须填昵称
        if (!userId && !finalNickname) {
            return res.json({ code: -1, message: '请填写昵称' });
        }

        if (finalNickname && finalNickname.length > 50) {
            return res.json({ code: -1, message: '昵称不能超过 50 字' });
        }

        // ============ 防刷 ============
        const ip = req.ip || req.headers['x-forwarded-for'] || '';
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

        const recentCount = await Comment.count({
            where: {
                ip,
                createdAt: { [Op.gt]: oneMinuteAgo },
            },
        });

        if (recentCount >= 3) {
            return res.json({ code: -1, message: '评论过于频繁，请稍后再试' });
        }

        // ============ 处理父评论 ============
        let level = 1;
        let path = '';
        let replyTo = null;
        let finalParentId = null;

        if (parentId) {
            const parent = await Comment.findByPk(parentId);

            if (!parent) {
                return res.json({ code: -1, message: '父评论不存在' });
            }

            if (parent.targetType !== targetType ||
                parent.targetId !== targetId) {
                return res.json({ code: -1, message: '父评论与目标不匹配' });
            }

            finalParentId = parent.id;
            level = parent.level + 1;
            path = parent.path ? `${parent.path}.${parent.id}` : String(parent.id);
            replyTo = parent.nickname;
        }

        // ============ 创建评论 ============
        const comment = await Comment.create({
            targetType,
            targetId: targetId,
            memberId: userId || null,
            nickname: finalNickname,
            avatar,
            email: email?.trim() || null,
            content: cleanContent,  // ✅ 存清洗后的富文本
            parentId: finalParentId,
            path,
            level,
            replyTo,
            status: 0,
            ip,
            userAgent: req.headers['user-agent'] || '',
        });

        // 更新父评论回复数
        if (finalParentId) {
            await Comment.increment('replyCount', {
                where: { id: finalParentId },
            });
        }

        res.json({
            code: 1,
            message: '评论成功',
            data: formatComment(comment),
        });
    } catch (error) {
        console.error('createComment error:', error);
        res.json({ code: -1, message: error.message });
    }
}

// ============================================================
// 获取我的评论
// GET /api/comments/my?page=1&limit=10
// ============================================================
async function getMyComments(req, res) {
    try {
        const userId = req.user ? req.user.toJSON().id : null;
        if (!userId) {
            return res.json({ code: -1, message: '未登录' });
        }

        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        const { count, rows } = await Comment.findAndCountAll({
            where: {
                memberId: userId,
                status: 0,
            },
            order: [['createdAt', 'DESC']],
            limit: limitNum,
            offset,
        });

        // 查询评论对象信息
        const articleIds = rows
            .filter(c => c.targetType === 'article')
            .map(c => c.targetId);

        const formulaIds = rows
            .filter(c => c.targetType === 'formula')
            .map(c => c.targetId);

        const [articles, formulas] = await Promise.all([
            articleIds.length
                ? Article.findAll({
                    where: { id: articleIds },
                    attributes: ['id', 'title', 'img'],
                })
                : [],
            formulaIds.length
                ? Formula.findAll({
                    where: { fs_id: formulaIds },
                    attributes: ['fs_id', 'server_filename', 'img'],
                })
                : [],
        ]);

        const articleMap = {};
        articles.forEach(a => { articleMap[a.id] = a; });

        const formulaMap = {};
        formulas.forEach(f => { formulaMap[f.fs_id] = f; });

        const data = rows.map(comment => {
            const plain = formatComment(comment);
            return {
                ...plain,
                target: comment.targetType === 'article'
                    ? articleMap[comment.targetId] || null
                    : formulaMap[comment.targetId] || null,
            };
        });

        res.json({
            code: 1,
            count,
            data,
        });
    } catch (error) {
        console.error('getMyComments error:', error);
        res.json({ code: -1, message: error.message });
    }
}

// ============================================================
// 删除评论（级联删除子评论）
// DELETE /api/comments/:id
// ============================================================
async function deleteComment(req, res) {
    try {
        const userId = req.user ? req.user.toJSON().id : null;
        if (!userId) {
            return res.json({ code: -1, message: '未登录' });
        }

        const { id } = req.params;

        const comment = await Comment.findOne({
            where: { id, memberId: userId },
        });

        if (!comment) {
            return res.json({ code: -1, message: '评论不存在或无权删除' });
        }

        // 删除所有子评论（通过 path 匹配）
        const pathPattern = comment.path
            ? `${comment.path}.${comment.id}%`
            : `${comment.id}%`;

        await Comment.destroy({
            where: {
                [Op.or]: [
                    { id: comment.id },
                    { path: { [Op.like]: pathPattern } },
                ],
            },
        });

        // 更新父评论回复数
        if (comment.parentId) {
            await Comment.decrement('replyCount', {
                where: { id: comment.parentId },
            });
        }

        res.json({ code: 1, message: '删除成功' });
    } catch (error) {
        console.error('deleteComment error:', error);
        res.json({ code: -1, message: error.message });
    }
}

// ============================================================
// 辅助函数：格式化评论
// ============================================================
function formatComment(comment) {
    const plain = comment.get ? comment.get({ plain: true }) : comment;

    return {
        id: plain.id,
        targetType: plain.targetType,
        targetId: plain.targetId,
        memberId: plain.memberId,
        nickname: plain.nickname,
        avatar: plain.avatar,
        content: plain.content,
        parentId: plain.parentId,
        path: plain.path,
        level: plain.level,
        replyTo: plain.replyTo,
        replyCount: plain.replyCount || 0,
        likes: plain.likes || 0,
        createdAt: plain.createdAt,
        isAnonymous: !plain.memberId,
    };
}

module.exports = {
    getComments,
    createComment,
    getMyComments,
    deleteComment,
};