// controllers/formulaController.js
const { Op } = require('sequelize');
const Formula = require('../models/Formula');
/**
 * 获取下载列表
 * GET /api/formulas?page=1&limit=12&category=&kind=&search=&sort=
 */
async function getFormulas(req, res) {
    try {
        const {
            page = 1,
            limit = 6,
            kind,
            search,
            sort = 'latest',
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        // ✅ 查询条件：只显示可下载的文件（status = 0，非目录）
        const where = {
            status: 1,
            isdir: 0,
        };

        if (kind) where.kind = kind;

        if (search) {
            where[Op.or] = [
                { server_filename: { [Op.like]: `%${search}%` } },
                { summary: { [Op.like]: `%${search}%` } },
            ];
        }

        // ✅ 排序
        const orderMap = {
            latest: [['server_ctime', 'DESC']],
            oldest: [['server_ctime', 'ASC']],
            popular: [['views', 'DESC']],
            likes: [['likes', 'DESC']],
            price_asc: [['price', 'ASC']],
            price_desc: [['price', 'DESC']],
        };
        const order = orderMap[sort] || orderMap.latest;

        const { count, rows } = await Formula.findAndCountAll({
            where,
            order,
            limit: limitNum,
            offset,
            attributes: [
                'fs_id', 'server_filename', 'size', 'category', 'kind',
                'img', 'summary', 'price', 'isSell', 'views', 'likes',
                'server_ctime', 'server_mtime',
            ],
        });

        // ✅ 格式化数据
        const data = rows.map(item => formatFormula(item, false));

        res.json({
            code: 1,
            message: 'success',
            count,
            data,
        });
    } catch (error) {
        console.error('getFormulas error:', error);
        res.json({
            code: -1,
            message: error.message,
            count: 0,
            data: [],
        });
    }
}

/**
 * 获取文件详情
 * GET /api/formulas/:id
 */
async function getFormulaById(req, res) {
    try {
        const { id } = req.params;

        const formula = await Formula.findOne({
            where: {
                fs_id: id,
                status: 1,
                isdir: 0,
            },
        });

        if (!formula) {
            return res.json({
                code: -1,
                message: '文件不存在',
                data: null,
            });
        }

        // ✅ 增加浏览次数
        await formula.increment('views');

        res.json({
            code: 1,
            message: 'success',
            data: formatFormula(formula, true),
        });
    } catch (error) {
        console.error('getFormulaById error:', error);
        res.json({
            code: -1,
            message: error.message,
            data: null,
        });
    }
}
async function incrementViewCount(req, res) {
    try {
        const { id } = req.params;
        const { uid } = req.body || {};

        if (!id) {
            return res.json({ code: -1, message: '缺少文件 ID' });
        }

        // ✅ 查找文件
        const formula = await Formula.findOne({
            where: {
                fs_id: id,
                status: 0,
                isdir: 0,
            },
            attributes: ['fs_id', 'views'],
        });

        if (!formula) {
            return res.json({ code: -1, message: '文件不存在' });
        }

        // ✅ 原子操作 +1
        await Formula.increment('views', { where: { fs_id: id }, });

        const newViews = (formula.views || 0) + 1;

        res.json({ code: 1, message: 'success', data: { fs_id: formula.fs_id, views: newViews, }, });
    } catch (error) {
        console.error('incrementView error:', error);
        res.json({ code: -1, message: error.message, });
    }
}

async function incrementDownloadCount(req, res) {
    try {
        const { id } = req.params;

        // ✅ 查找文件
        const formula = await Formula.findOne({
            where: { fs_id: id },
            attributes: ['fs_id'],
        });

        if (!formula) {
            return res.json({ code: -1, message: '文件不存在' });
        }

        // ✅ 增加下载次数（如果有这个字段）
        await Formula.increment('downloads', { where: { fs_id: id }, });

        res.json({ code: 1, message: 'success', });
    } catch (error) {
        console.error('incrementDownloadCount error:', error);
        res.json({ code: -1, message: error.message, });
    }
}
/**
 * 下载文件点赞/取消点赞
 * POST /api/formulas/:id/like
 */
async function toggleLike(req, res) {
    try {
        const { id } = req.params;
        const { action = 'like' } = req.body;

        if (!id) {
            return res.json({ code: -1, message: '缺少文件 ID' });
        }

        const formula = await Formula.findOne({
            where: { fs_id: id, status: 1, isdir: 0 },
            attributes: ['fs_id', 'likes'],
        });

        if (!formula) {
            return res.json({ code: -1, message: '文件不存在' });
        }

        const currentLikes = formula.likes || 0;
        let newLikes;

        if (action === 'unlike') {
            newLikes = Math.max(0, currentLikes - 1);
            await Formula.update(
                { likes: newLikes },
                { where: { fs_id: id } }
            );
        } else {
            await Formula.increment('likes', { where: { fs_id: id } });
            newLikes = currentLikes + 1;
        }

        res.json({
            code: 1,
            message: 'success',
            data: { fs_id: formula.fs_id, likes: newLikes, action, },
        });
    } catch (error) {
        console.error('toggleLike error:', error);
        res.json({ code: -1, message: error.message });
    }
}
async function toggleBookmark(req, res) {
    try {
        const { id } = req.params;
        const { action = 'bookmark' } = req.body;

        if (!id) {
            return res.json({ code: -1, message: '缺少文件 ID' });
        }

        const formula = await Formula.findOne({
            where: { fs_id: id, status: 0, isdir: 0 },
            attributes: ['fs_id', 'marked'],
        });

        if (!formula) {
            return res.json({ code: -1, message: '文件不存在' });
        }

        const currentMarked = formula.marked || 0;
        let newMarked;

        if (action === 'unbookmark') {
            newMarked = Math.max(0, currentMarked - 1);
            await Formula.update(
                { marked: newMarked },
                { where: { fs_id: id } }
            );
        } else {
            await Formula.increment('marked', { where: { fs_id: id } });
            newMarked = currentMarked + 1;
        }

        res.json({ code: 1, message: 'success', data: { fs_id: formula.fs_id, marked: newMarked, action, }, });
    } catch (error) {
        console.error('toggleBookmark error:', error);
        res.json({ code: -1, message: error.message });
    }
}
/**
 * 增加点赞
 * POST /api/formulas/:id/like
 */
async function likeFormula(req, res) {
    try {
        const { id } = req.params;

        const formula = await Formula.findByPk(id);
        if (!formula) {
            return res.json({ code: -1, message: '文件不存在' });
        }

        await formula.increment('likes');

        res.json({ code: 1, message: 'success', data: { likes: formula.likes + 1 }, });
    } catch (error) {
        res.json({ code: -1, message: error.message });
    }
}

/**
 * 获取下载链接
 * GET /api/formulas/:id/download
 */
async function getDownloadUrl(req, res) {
    try {
        const { id } = req.params;

        const formula = await Formula.findOne({
            where: { fs_id: id, status: 0, isdir: 0 },
        });

        if (!formula) {
            return res.json({ code: -1, message: '文件不存在' });
        }

        // ✅ 如果是从百度网盘同步的，可以使用 fs_id 构造下载链接
        // 具体实现取决于你的下载策略：
        // 方案A：直接返回百度网盘链接
        // 方案B：通过百度网盘 API 获取临时下载链接
        // 方案C：文件已同步到本地服务器

        // 方案A 示例：
        const downloadUrl = `https://pan.baidu.com/api/download?fsid=${formula.fs_id}`;

        // 方案B 示例（推荐，更安全）：
        // const downloadUrl = await baiduPanAPI.getDownloadUrl(formula.fs_id);

        res.json({
            code: 1,
            message: 'success',
            data: {
                downloadUrl,
                filename: formula.server_filename,
                size: formula.size,
                isSell: formula.isSell,
                price: formula.price,
            },
        });
    } catch (error) {
        res.json({ code: -1, message: error.message });
    }
}

/**
 * 格式化文件数据
 */
function formatFormula(item, includeContent = false) {
    const plain = item.get ? item.get({ plain: true }) : item;

    const data = {
        fs_id: plain.fs_id,
        server_filename: plain.server_filename,
        size: plain.size,
        sizeText: formatFileSize(plain.size),
        category: plain.category,
        kind: plain.kind,
        img: plain.img,
        summary: plain.summary,
        price: plain.price,
        isSell: plain.isSell,
        views: plain.views,
        likes: plain.likes,
        author: plain.author || { name: '缠说・股经', avatar: '/img/avatar.jpg' },
        server_ctime: plain.server_ctime,
        server_mtime: plain.server_mtime,
        createtime: plain.createtime,
        // ✅ 列表也返回 hasContent 标记（不返回完整 content，节省带宽）
        hasContent: (plain.content && plain.content.trim().length > 0),
    };

    // ✅ 详情页才返回 content
    if (includeContent) {
        data.content = plain.content;
        data.path = plain.path;
        data.md5 = plain.md5;
        data.xhsUrl = plain.xhsUrl;
    }

    return data;
}

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

module.exports = {
    getFormulas,
    getFormulaById,
    likeFormula,
    getDownloadUrl,
    incrementDownloadCount,
    incrementViewCount,
    toggleLike,
    toggleBookmark,
};