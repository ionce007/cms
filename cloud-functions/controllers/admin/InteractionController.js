// controllers/admin/InteractionController.js
const { Comment, MemberLike, MemberBookmark, MemberDownload, Member, Article, Formula } = require('../../models');
const { Op } = require('sequelize');

// ==================== 评论管理 ====================

async function getComments(req, res) {
    try {
        const { page = 1, limit = 10, status, keyword, targetType } = req.query;
        const where = {};

        if (status !== undefined && status !== '') where.status = status;
        if (keyword) where.content = { [Op.like]: `%${keyword}%` };
        if (targetType) where.targetType = targetType;

        const { count, rows } = await Comment.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: (page - 1) * limit,
        });

        const data = await Promise.all(rows.map(async (comment) => {
            const plain = comment.get({ plain: true });
            let targetTitle = '目标内容已删除或无法读取';

            if (plain.targetType === 'article') {
                const a = await Article.findByPk(plain.targetId, { attributes: ['title'] });
                if (a && a.title) targetTitle = a.title;
            } else if (plain.targetType === 'formula') {
                const f = await Formula.findByPk(plain.targetId, { attributes: ['server_filename'] });
                if (f && f.server_filename) targetTitle = f.server_filename;
            }
            return { ...plain, targetTitle };
        }));

        res.json({ code: 1, data, total: count });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

async function updateCommentStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (status === undefined || ![0, 1, 2].includes(Number(status))) {
            return res.json({ code: -1, message: '无效的评论状态值' });
        }
        const comment = await Comment.findByPk(id);
        if (!comment) return res.json({ code: -1, message: '评论不存在' });
        await comment.update({ status: Number(status) });
        res.json({ code: 1, message: '状态更新成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

async function deleteComment(req, res) {
    try {
        const { id } = req.params;
        const comment = await Comment.findByPk(id);
        if (!comment) return res.json({ code: -1, message: '评论不存在' });
        await comment.destroy();
        res.json({ code: 1, message: '删除成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// ==================== 点赞管理 ====================

async function getLikes(req, res) {
    try {
        const { page = 1, limit = 10, targetType } = req.query;
        const where = {};
        if (targetType) where.targetType = targetType;

        const { count, rows } = await MemberLike.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: (page - 1) * limit,
            include: [{
                model: Member,
                as: 'Member', // ✅ 核心修复：必须加上 as 别名
                attributes: ['id', 'nickname', 'username']
            }]
        });

        const data = await Promise.all(rows.map(async (like) => {
            const plain = like.get({ plain: true });
            let targetTitle = '目标内容已删除';

            if (plain.targetType === 'article') {
                const a = await Article.findByPk(plain.targetId, { attributes: ['title'] });
                if (a && a.title) targetTitle = a.title;
            } else if (plain.targetType === 'formula') {
                const f = await Formula.findByPk(plain.targetId, { attributes: ['server_filename'] });
                if (f && f.server_filename) targetTitle = f.server_filename;
            }
            return { ...plain, targetTitle };
        }));

        res.json({ code: 1, data, total: count });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

async function deleteLike(req, res) {
    try {
        const { id } = req.params;
        const like = await MemberLike.findByPk(id);
        if (!like) return res.json({ code: -1, message: '记录不存在' });
        await like.destroy();
        res.json({ code: 1, message: '删除成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// ==================== 收藏管理 ====================

async function getBookmarks(req, res) {
    try {
        const { page = 1, limit = 10, targetType } = req.query;
        const where = {};
        if (targetType) where.targetType = targetType;

        const { count, rows } = await MemberBookmark.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: (page - 1) * limit,
            include: [{
                model: Member,
                as: 'Member', // ✅ 核心修复：必须加上 as 别名
                attributes: ['id', 'nickname', 'username']
            }]
        });

        const data = await Promise.all(rows.map(async (bookmark) => {
            const plain = bookmark.get({ plain: true });
            let targetTitle = '目标内容已删除';

            if (plain.targetType === 'article') {
                const a = await Article.findByPk(plain.targetId, { attributes: ['title'] });
                if (a && a.title) targetTitle = a.title;
            } else if (plain.targetType === 'formula') {
                const f = await Formula.findByPk(plain.targetId, { attributes: ['server_filename'] });
                if (f && f.server_filename) targetTitle = f.server_filename;
            }
            return { ...plain, targetTitle };
        }));

        res.json({ code: 1, data, total: count });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

async function deleteBookmark(req, res) {
    try {
        const { id } = req.params;
        const bookmark = await MemberBookmark.findByPk(id);
        if (!bookmark) return res.json({ code: -1, message: '记录不存在' });
        await bookmark.destroy();
        res.json({ code: 1, message: '删除成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}
// ==================== 下载管理 ====================

// 获取下载记录列表
async function getDownloads(req, res) {
    try {
        const { page = 1, limit = 10, targetType, keyword } = req.query;
        const where = {};
        if (targetType) where.targetType = targetType;

        const { count, rows } = await MemberDownload.findAndCountAll({
            where,
            order: [['lastDownloadAt', 'DESC']], // 按最后下载时间排序
            limit: parseInt(limit),
            offset: (page - 1) * limit,
            include: [{
                model: Member,
                as: 'Member',
                attributes: ['id', 'nickname', 'username']
            }]
        });

        // 附带目标标题
        const data = await Promise.all(rows.map(async (download) => {
            const plain = download.get({ plain: true });
            let targetTitle = '目标内容已删除';

            // 下载目前只针对 formula
            if (plain.targetType === 'formula' || plain.targetType === 'article') {
                const f = await Formula.findByPk(plain.targetId, { attributes: ['server_filename'] });
                if (f && f.server_filename) targetTitle = f.server_filename;
            }
            return { ...plain, targetTitle };
        }));

        res.json({ code: 1, data, total: count });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// 删除下载记录
async function deleteDownload(req, res) {
    try {
        const { id } = req.params;
        const download = await MemberDownload.findByPk(id);
        if (!download) return res.json({ code: -1, message: '记录不存在' });

        await download.destroy();
        res.json({ code: 1, message: '删除成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

module.exports = {
    getComments,
    updateCommentStatus,
    deleteComment,
    getLikes,
    deleteLike,
    getBookmarks,
    deleteBookmark,
    getDownloads,   // ✅ 新增
    deleteDownload  // ✅ 新增
};