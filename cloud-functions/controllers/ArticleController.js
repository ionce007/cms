const { Op } = require('sequelize');
import sequelize from '../common/db';  // 导入 sequelize 实例
const { Category, Article, ArticleTag, Tag } = require('../models');
import { calcReadTime } from '../common/utils';

async function test(req, res, next) {
    console.log('Tag 表名:', Tag.getTableName());
    const articles = await Article.findAll({
        where: {
            status: 0,
            [Op.and]: [
                sequelize.where(
                    sequelize.fn('FIND_IN_SET', '1', sequelize.col('attr')),
                    { [Op.gt]: 0 }
                ),
                sequelize.where(
                    sequelize.fn('FIND_IN_SET', '2', sequelize.col('attr')),
                    { [Op.gt]: 0 }
                )
            ]
        }
    });
    res.json({ code: 1, message: 'Articles retrieved successfully', data: articles });
}

async function getArticles(req, res, next) {
    try {
        const { page = 1, limit = 10, cid, search, sort } = req.query;
        const offset = (page - 1) * limit;

        let where = {
            [Op.and]: [
                { tagId: { [Op.ne]: null } },
                sequelize.where(
                    sequelize.fn('LENGTH', sequelize.col('tagId')),
                    { [Op.gt]: 0 }
                )
            ]
        };

        if (cid) where.cid = cid;

        // ✅ 用 $Model.field$ 引用关联字段
        if (search) {
            where[Op.and].push({
                [Op.or]: [
                    { title: { [Op.like]: `%${search}%` } },
                    { content: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } },
                    { '$Category.name$': { [Op.like]: `%${search}%` } },
                    { '$Tags.name$': { [Op.like]: `%${search}%` } }
                ]
            });
        }

        const include = [
            {
                model: Category,
                as: 'Category',
                required: false,
                attributes: {
                    exclude: ['seoTitle', 'seoKeywords', 'seoDescription', 'orderBy', 'listView', 'articleView']
                }
            },
            {
                model: Tag,
                as: 'Tags',
                through: { attributes: [] },
                required: false,
                attributes: ['id', 'name']
            }
        ];

        // 排序
        let order = [['createdAt', 'DESC']];
        if (sort === 'oldest') order = [['createdAt', 'ASC']];
        else if (sort === 'popular') order = [['pv', 'DESC']];
        else if (sort === 'mostLiked') order = [['likes', 'DESC']];

        // ✅ 不再用 literal 子查询，标签通过 include 得到
        const attributes = {
            exclude: ['subCid', 'articleView', 'source', 'status']
            // 不 exclude content，因为要算 readTime
        };

        const { count, rows } = await Article.findAndCountAll({
            attributes,
            where,
            include,
            order,
            limit,
            offset,
            distinct: true
        });

        const result = rows.map(article => {
            const plain = article.toJSON();

            if (plain.author && typeof plain.author === 'string') {
                try {
                    plain.author = JSON.parse(plain.author);
                } catch { }
            }

            if (plain.content) {
                plain.readTime = calcReadTime(plain.content);
                // 如果不想返回 content，可以删除
                // delete plain.content;
            }

            return plain;
        });

        res.json({
            code: 1,
            message: 'Articles retrieved successfully',
            count,
            data: result
        });
    } catch (error) {
        console.error('getArticles error:', error);
        res.json({
            code: -1,
            message: error.message,
            count: 0,
            data: []
        });
    }
}
async function getCategoryArticles(req, res, next) {
    try {
        const { page = 1, limit = 10, slug, sort } = req.body;
        const offset = (page - 1) * limit;

        let where = {
            status: 0,
            [Op.and]: [
                { tagId: { [Op.ne]: null } },
                sequelize.where(
                    sequelize.fn('LENGTH', sequelize.col('tagId')),
                    { [Op.gt]: 0 }
                )
            ]
        };

        // ✅ 关联 Category，加 as，用 INNER JOIN 过滤 slug
        const include = [
            {
                model: Category,
                as: 'Category',
                required: true,
                where: { pinyin: slug },
                attributes: {
                    exclude: [
                        'seoTitle',
                        'seoKeywords',
                        'seoDescription',
                        'orderBy',
                        'listView',
                        'articleView'
                    ]
                }
            },
            // ✅ 用中间表查标签，替代 FIND_IN_SET 子查询
            {
                model: Tag,
                as: 'Tags',
                through: { attributes: [] },
                required: false,
                attributes: ['id', 'name', 'path']
            }
        ];

        // 排序
        let order = [['createdAt', 'DESC']];
        if (sort === 'oldest') {
            order = [['createdAt', 'ASC']];
        } else if (sort === 'popular') {
            order = [['pv', 'DESC']];
        } else if (sort === 'mostLiked') {
            order = [['likes', 'DESC']];
        }

        // ✅ 不再用 literal 子查询，标签通过 include 得到
        const attributes = {
            exclude: ['subCid', 'articleView', 'source', 'status']
            // 不 exclude content，如需算阅读时长要保留
        };

        const { count, rows } = await Article.findAndCountAll({
            attributes,
            where,
            include,
            order,
            limit,
            offset,
            distinct: true   // ✅ 避免 include 导致 count 不准
        });

        const result = rows.map(article => {
            const plain = article.toJSON();

            // Tags 是数组，不需要 JSON.parse
            // 只有 author 可能是 JSON 字符串
            if (plain.author && typeof plain.author === 'string') {
                try {
                    plain.author = JSON.parse(plain.author);
                } catch {
                    // 不是 JSON，保持原样
                }
            }

            // 如需计算阅读时长
            if (plain.content) {
                plain.readTime = calcReadTime(plain.content);
            }

            return plain;
        });

        res.json({
            code: 1,
            message: 'Articles retrieved successfully',
            count,
            data: result
        });
    } catch (error) {
        console.error('Error in getCategoryArticles:', error);
        res.json({
            code: -1,
            message: error.message,
            count: 0,
            data: []
        });
    }
}
async function getTagArticles(req, res, next) {
    try {
        const { slug, tagName, page = 1, limit = 6, sort = 'latest' } = req.body;

        // ✅ 参数校验
        if (!slug && !tagName) {
            return res.json({ code: -1, message: '缺少 slug 或 tagName 参数', count: 0, data: [] });
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 6;
        const offset = (pageNum - 1) * limitNum;

        // ✅ 查找标签（优先用 slug，其次用 name）
        let tag = null;
        if (slug) {
            tag = await Tag.findOne({ where: { path: slug } });
        }
        if (!tag && tagName) {
            tag = await Tag.findOne({ where: { name: tagName } });
        }

        if (!tag) {
            return res.json({
                code: 1,
                message: '标签不存在',
                count: 0,
                data: []
            });
        }

        const tagId = tag.id;

        // ✅ 排序规则
        const orderMap = {
            latest: [['createdAt', 'DESC']],
            oldest: [['createdAt', 'ASC']],
            popular: [['pv', 'DESC']],
            likes: [['likes', 'DESC']]
        };
        const order = orderMap[sort] || orderMap.latest;

        // ✅ include 改为数组，加 as
        const include = [
            {
                model: Category,
                as: 'Category',
                required: false,
                attributes: {
                    exclude: [
                        'seoTitle',
                        'seoKeywords',
                        'seoDescription',
                        'orderBy',
                        'listView',
                        'articleView'
                    ]
                }
            },
            {
                model: Tag,
                as: 'Tags',
                through: { attributes: [] },
                required: false,
                attributes: ['id', 'name', 'path']
            }
        ];

        // ✅ 用中间表关联查文章（替代 FIND_IN_SET）
        const { count, rows } = await Article.findAndCountAll({
            attributes: {
                exclude: ['subCid', 'articleView', 'source', 'status']
                // 不 exclude content，如需算 readTime 要保留
            },
            where: {
                status: 0
            },
            include: [
                ...include,
                // ✅ 用 Tags 关联过滤当前标签（INNER JOIN）
                {
                    model: Tag,
                    as: 'Tags',
                    through: { attributes: [] },
                    required: true,          // INNER JOIN，只返回有该标签的文章
                    where: { id: tagId },
                    attributes: ['id', 'name', 'path']
                }
            ],
            limit: limitNum,
            offset,
            order,
            distinct: true
        });

        const result = rows.map(article => {
            const plain = article.toJSON();

            // Tags 是数组，不需要 JSON.parse
            // 只有 author 可能是 JSON 字符串
            if (plain.author && typeof plain.author === 'string') {
                try {
                    plain.author = JSON.parse(plain.author);
                } catch {
                    // 不是 JSON，保持原样
                }
            }

            // 如需计算阅读时长
            if (plain.content) {
                plain.readTime = calcReadTime(plain.content);
            }

            return plain;
        });

        res.json({ code: 1, message: 'Articles retrieved successfully', count, data: result });
    } catch (error) {
        console.error('getTagArticles error:', error);
        res.json({ code: -1, message: error.message, count: 0, data: [] });
    }
}
async function searchArticles(req, res, next) {
    try {
        const { page = 1, limit = 10, category, tag, search, sort } = req.body;
        const offset = (page - 1) * limit;

        // ✅ 基础条件：只查已发布
        const where = {
            status: 0
        };

        // 栏目过滤
        if (category) {
            where.cid = category;
        }

        // 关键词搜索
        if (search) {
            where[Op.and] = where[Op.and] || [];
            where[Op.and].push({
                [Op.or]: [
                    { title: { [Op.like]: `%${search}%` } },
                    { content: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } }
                ]
            });
        }

        // ✅ 排序规则
        const orderMap = {
            latest: [['createdAt', 'DESC']],
            oldest: [['createdAt', 'ASC']],
            popular: [['pv', 'DESC']],
            mostLiked: [['likes', 'DESC']]
        };
        const order = orderMap[sort] || orderMap.latest;

        // ✅ 关联定义：Category + Tags
        const include = [
            {
                model: Category,
                as: 'Category',
                required: false,
                attributes: {
                    exclude: [
                        'seoTitle',
                        'seoKeywords',
                        'seoDescription',
                        'orderBy',
                        'listView',
                        'articleView'
                    ]
                }
            },
            {
                model: Tag,
                as: 'Tags',
                through: { attributes: [] },
                required: !!tag,             // 有 tag 时用 INNER JOIN
                where: tag ? { id: tag } : undefined,  // 标签过滤
                attributes: ['id', 'name', 'path']
            }
        ];

        // ✅ 不 exclude content，如需算 readTime 要保留
        const attributes = {
            exclude: ['subCid', 'articleView', 'source', 'status']
        };

        const { count, rows } = await Article.findAndCountAll({
            attributes,
            where,
            include,
            order,
            limit,
            offset,
            distinct: true   // ✅ 避免 include 导致 count 不准
        });

        const result = rows.map(article => {
            const plain = article.toJSON();

            // Tags 是数组，不需要 JSON.parse
            // 只有 author 可能是 JSON 字符串
            if (plain.author && typeof plain.author === 'string') {
                try {
                    plain.author = JSON.parse(plain.author);
                } catch {
                    // 不是 JSON，保持原样
                }
            }

            // 如需计算阅读时长
            if (plain.content) {
                plain.readTime = calcReadTime(plain.content);
            }

            return plain;
        });

        res.json({ code: 1, message: 'Articles retrieved successfully', count, data: result });
    } catch (error) {
        console.error('Error in searchArticles:', error);
        res.json({ code: -1, message: error.message, count: 0, data: [] });
    }
}
async function getRecentArticles(req, res, next) {
    try {
        const { page = 1, limit = 6 } = req.query;
        const offset = 0;
        const where = { status: 0 };
        const order = [['createdAt', 'DESC']];

        // ✅ include 改为数组 + 加 as
        const include = [
            {
                model: Category,
                as: 'Category',
                required: false,
                attributes: {
                    exclude: [
                        'seoTitle',
                        'seoKeywords',
                        'seoDescription',
                        'orderBy',
                        'listView',
                        'articleView'
                    ]
                }
            },
            {
                model: Tag,
                as: 'Tags',
                through: { attributes: [] },
                required: false,
                attributes: ['id', 'name', 'path']
            }
        ];

        // ✅ 不再用 literal 子查询，标签通过 include 得到
        const attributes = {
            exclude: ['subCid', 'articleView', 'source', 'status']
            // 不 exclude content，如需算 readTime 要保留
        };

        const articles = await Article.findAll({
            attributes,
            where,
            include,
            limit: Number(limit),
            offset,
            order,
            distinct: true   // ✅ 避免 include 导致条数重复
        });

        const result = articles.map(article => {
            const plain = article.toJSON();

            // Tags 是数组，不需要 JSON.parse
            // 只有 author 可能是 JSON 字符串
            if (plain.author && typeof plain.author === 'string') {
                try {
                    plain.author = JSON.parse(plain.author);
                } catch {
                    // 不是 JSON，保持原样
                }
            }

            // 如需计算阅读时长
            if (plain.content) {
                plain.readTime = calcReadTime(plain.content);
            }

            return plain;
        });

        res.json({ code: 1, message: 'Articles retrieved successfully', count: articles.length, data: result });
    } catch (error) {
        console.error('Error in getRecentArticles:', error);
        res.json({ code: -1, message: error.message, data: null });
    }
}
async function getPinnedArticles(req, res, next) {
    try {
        const { limit = 1 } = req.params || req.query;

        // ✅ attr 过滤（保留，这是置顶标记，不是标签关联）
        const where = {
            status: 0,
            [Op.and]: [
                sequelize.where(
                    sequelize.fn('FIND_IN_SET', '1', sequelize.col('attr')),
                    { [Op.gt]: 0 }
                ),
                sequelize.where(
                    sequelize.fn('FIND_IN_SET', '2', sequelize.col('attr')),
                    { [Op.gt]: 0 }
                )
            ]
        };

        const order = [['createdAt', 'DESC']];

        // ✅ include 改为数组 + 加 as
        const include = [
            {
                model: Category,
                as: 'Category',
                required: false,
                attributes: {
                    exclude: [
                        'seoTitle',
                        'seoKeywords',
                        'seoDescription',
                        'orderBy',
                        'listView',
                        'articleView'
                    ]
                }
            },
            {
                model: Tag,
                as: 'Tags',
                through: { attributes: [] },
                required: false,
                attributes: ['id', 'name', 'path']
            }
        ];

        // ✅ 不再用 literal 子查询，标签通过 include 得到
        const attributes = {
            exclude: ['subCid', 'articleView', 'source', 'status']
            // 不 exclude content，因为要算 readTime
        };

        const articles = await Article.findAll({
            attributes,
            where,
            include,
            limit: Number(limit),
            offset: 0,
            order,
            distinct: true   // ✅ 避免 include 导致条数重复
        });

        // ✅ 空数组判断（不是 !articles）
        if (!articles || articles.length === 0) {
            return res.status(404).json({ code: -1, message: 'Article not found' });
        }

        const result = articles.map(article => {
            const plain = article.toJSON();

            // Tags 是数组，不需要 JSON.parse
            // 只有 author 可能是 JSON 字符串
            if (plain.author && typeof plain.author === 'string') {
                try {
                    plain.author = JSON.parse(plain.author);
                } catch {
                    // 不是 JSON，保持原样
                }
            }

            // 计算阅读时长
            if (plain.content) {
                plain.readTime = calcReadTime(plain.content);
            }

            return plain;
        });

        res.json({ code: 1, message: 'Article retrieved successfully', data: result[0] });
    } catch (error) {
        console.log('error = ', error);
        next(error);
    }
}
async function getArticleById(req, res, next) {
    try {
        const { id } = req.params || req.query;
        if (!id) return res.status(404).json({ code: -1, message: '缺少参数' });

        const where = { id };

        // ✅ include 改为数组 + 加 as
        const include = [
            {
                model: Category,
                as: 'Category',
                required: false,
                attributes: {
                    exclude: [
                        'seoTitle',
                        'seoKeywords',
                        'seoDescription',
                        'orderBy',
                        'listView',
                        'articleView'
                    ]
                }
            },
            {
                model: Tag,
                as: 'Tags',
                through: { attributes: [] },
                required: false,
                attributes: ['id', 'name', 'path']
            }
        ];

        // ✅ 不 exclude content，如需算 readTime 要保留
        const attributes = {
            exclude: ['subCid', 'articleView', 'source', 'status']
        };

        const article = await Article.findOne({
            attributes,
            where,
            include,
            distinct: true
        });

        if (!article) {
            return res.status(404).json({ code: -1, message: 'Article not found' });
        }

        const plain = article.toJSON();

        // Tags 是数组，不需要 JSON.parse
        // 只有 author 可能是 JSON 字符串
        if (plain.author && typeof plain.author === 'string') {
            try {
                plain.author = JSON.parse(plain.author);
            } catch {
                // 不是 JSON，保持原样
            }
        }

        // 计算阅读时长
        if (plain.content) {
            plain.readTime = calcReadTime(plain.content);
        }

        res.json({ code: 1, message: 'Article retrieved successfully', article: plain });
    } catch (error) {
        console.error('Error in getArticleById:', error);
        next(error);
    }
}
async function incrementViewCount(req, res, next) {
    try {
        const { id } = req.params || req.query;
        if (!id) {
            return res.json({ code: -1, message: '缺少文章 ID' });
        }
        const article = await Article.findByPk(id);
        if (!article) {
            return res.json({ code: -1, message: '未找到相应的文章' });
        }
        // ✅ 原子操作 +1
        await Article.increment('pv', { where: { id }, });
        const newPv = (article.pv || 0) + 1;
        res.json({ code: 1, message: 'success', data: { id: article.id, pv: newPv, }, });
    } catch (error) {
        console.error('incrementView error:', error);
        res.json({ code: -1, message: error.message, });
    }
}
/**
 * 文章点赞/取消点赞
 * POST /api/articles/:id/like
 * 
 * Body: { action: 'like' | 'unlike' }
 */
async function toggleLike(req, res) {
    try {
        const { id } = req.params;
        const { action = 'like' } = req.body;

        if (!id) {
            return res.json({ code: -1, message: '缺少文章 ID' });
        }

        const article = await Article.findByPk(id, {
            attributes: ['id', 'likes'],
        });

        if (!article) {
            return res.json({ code: -1, message: '文章不存在' });
        }

        const currentLikes = article.likes || 0;
        let newLikes;

        if (action === 'unlike') {
            // ✅ 取消点赞：-1（不低于 0）
            newLikes = Math.max(0, currentLikes - 1);
            await Article.update(
                { likes: newLikes },
                { where: { id } }
            );
        } else {
            // ✅ 点赞：+1（原子操作）
            await Article.increment('likes', { where: { id } });
            newLikes = currentLikes + 1;
        }

        res.json({
            code: 1,
            message: 'success',
            data: {
                id: article.id,
                likes: newLikes,
                action,
            },
        });
    } catch (error) {
        console.error('toggleLike error:', error);
        res.json({ code: -1, message: error.message });
    }
}
/**
 * 文章收藏/取消收藏
 * POST /api/articles/:id/bookmark
 * 
 * Body: { action: 'bookmark' | 'unbookmark' }
 */
async function toggleBookmark(req, res) {
    try {
        const { id } = req.params;
        const { action = 'bookmark' } = req.body;

        if (!id) {
            return res.json({ code: -1, message: '缺少文章 ID' });
        }

        const article = await Article.findByPk(id, {
            attributes: ['id', 'marked'],
        });

        if (!article) {
            return res.json({ code: -1, message: '文章不存在' });
        }

        const currentMarked = article.marked || 0;
        let newMarked;

        if (action === 'unbookmark') {
            // ✅ 取消收藏：-1（不低于 0）
            newMarked = Math.max(0, currentMarked - 1);
            await Article.update(
                { marked: newMarked },
                { where: { id } }
            );
        } else {
            // ✅ 收藏：+1
            await Article.increment('marked', { where: { id } });
            newMarked = currentMarked + 1;
        }

        res.json({ code: 1, message: 'success', data: { id: article.id, marked: newMarked, action, }, });
    } catch (error) {
        console.error('toggleBookmark error:', error);
        res.json({ code: -1, message: error.message });
    }
}
async function getPopularArticles(req, res, next) {
    try {
        const { page = 1, limit = 5 } = req.query;
        const offset = (page - 1) * limit;

        const where = { status: 0 };
        const order = [['pv', 'DESC'], ['createdAt', 'DESC']];

        // ✅ include 改为数组 + 加 as
        const include = [
            {
                model: Category,
                as: 'Category',
                required: false,
                attributes: {
                    exclude: [
                        'seoTitle',
                        'seoKeywords',
                        'seoDescription',
                        'orderBy',
                        'listView',
                        'articleView'
                    ]
                }
            },
            {
                model: Tag,
                as: 'Tags',
                through: { attributes: [] },
                required: false,
                attributes: ['id', 'name', 'path']
            }
        ];

        // ✅ 不再用 literal 子查询，标签通过 include 得到
        const attributes = {
            exclude: ['subCid', 'articleView', 'source', 'status']
            // 不 exclude content，如需算 readTime 要保留
        };

        const articles = await Article.findAll({
            attributes,
            where,
            include,
            limit: Number(limit),
            offset: Number(offset),
            order,
            distinct: true   // ✅ 避免 include 导致条数重复
        });

        const result = articles.map(article => {
            const plain = article.toJSON();

            // Tags 是数组，不需要 JSON.parse
            // 只有 author 可能是 JSON 字符串
            if (plain.author && typeof plain.author === 'string') {
                try {
                    plain.author = JSON.parse(plain.author);
                } catch {
                    // 不是 JSON，保持原样
                }
            }

            // 如需计算阅读时长
            if (plain.content) {
                plain.readTime = calcReadTime(plain.content);
            }

            return plain;
        });

        res.json({ code: 1, message: 'Articles retrieved successfully', data: result });
    } catch (error) {
        console.error('Error in getPopularArticles:', error);
        res.json({ code: -1, message: error.message, data: null });
    }
}
async function getFeaturedArticles(req, res, next) {
    try {
        const { limit = 5 } = req.params || req.query;

        const where = {
            status: 0,
            [Op.and]: [
                sequelize.where(
                    sequelize.fn('FIND_IN_SET', '1', sequelize.col('attr')),
                    { [Op.gt]: 0 }
                ),
                sequelize.where(
                    sequelize.fn('FIND_IN_SET', '2', sequelize.col('attr')),
                    { [Op.gt]: 0 }
                )
            ]
        };

        const order = [['createdAt', 'DESC']];

        // 关联 Category
        const include = [
            {
                model: Category,
                as: 'Category',
                required: false,
                attributes: {
                    exclude: ['seoTitle', 'seoKeywords', 'seoDescription', 'orderBy', 'listView', 'articleView']
                }
            },
            {
                model: Tag,
                as: 'Tags',              // 与关联定义一致
                through: { attributes: [] },  // 不返回中间表字段
                required: false,
                attributes: ['id', 'name', 'path']
            }
        ];

        const attributes = {
            exclude: ['subCid', 'articleView', 'source', 'content', 'status']
        };

        const articles = await Article.findAll({
            attributes,
            where,
            include,
            limit,
            offset: 0,
            order,
            distinct: true   // 避免 include 导致条数不准
        });

        if (!articles || articles.length === 0) {
            return res.status(404).json({ code: -1, message: 'Article not found' });
        }

        const result = articles.map(article => {
            const plain = article.toJSON();
            // Tags 已经是数组，不需要 JSON.parse
            return plain;
        });

        res.json({ code: 1, message: 'Article retrieved successfully', data: result });
    } catch (error) {
        next(error);
    }
}
async function getArticlesByTag(req, res, next) {
    try {
        const { page = 1, limit = 10, tid } = req.query;
        const offset = (page - 1) * limit;

        if (!tid) {
            return res.json({ code: -1, message: '缺少 tid 参数', count: 0, data: [] });
        }

        const where = { status: 0 };

        // ✅ include 改为数组 + 加 as，用 Tags 关联过滤标签
        const include = [
            {
                model: Category,
                as: 'Category',
                required: false,
                attributes: {
                    exclude: [
                        'seoTitle',
                        'seoKeywords',
                        'seoDescription',
                        'orderBy',
                        'listView',
                        'articleView'
                    ]
                }
            },
            {
                model: Tag,
                as: 'Tags',
                through: { attributes: [] },
                required: true,              // INNER JOIN，只返回有该标签的文章
                where: { id: tid },          // ✅ 标签过滤
                attributes: ['id', 'name', 'path']
            }
        ];

        // ✅ 不再用 literal 子查询，标签通过 include 得到
        const attributes = {
            exclude: ['subCid', 'articleView', 'source', 'status']
            // 不 exclude content，如需算 readTime 要保留
        };

        const { count, rows } = await Article.findAndCountAll({
            attributes,
            where,
            include,
            limit: Number(limit),
            offset: Number(offset),
            order: [['createdAt', 'DESC']],
            distinct: true   // ✅ 避免 include 导致 count 不准
        });

        const result = rows.map(article => {
            const plain = article.toJSON();

            // Tags 是数组，不需要 JSON.parse
            // 只有 author 可能是 JSON 字符串
            if (plain.author && typeof plain.author === 'string') {
                try {
                    plain.author = JSON.parse(plain.author);
                } catch {
                    // 不是 JSON，保持原样
                }
            }

            // 如需计算阅读时长
            if (plain.content) {
                plain.readTime = calcReadTime(plain.content);
            }

            return plain;
        });

        res.json({ code: 1, message: 'Articles retrieved successfully', count, data: result });
    } catch (error) {
        console.error('Error in getArticlesByTag:', error);
        res.json({ code: -1, message: error.message, count: 0, data: [] });
    }
}
async function getRelatedArticlesById(req, res, next) {
    try {
        const { id } = req.params;
        const { limit = 3 } = req.query;
        if (!id) {
            if (!current) {
                return res.json({ code: -1, message: '缺少参数', articles: [] });
            }
        }
        // 1. 先查出当前文章
        const current = await Article.findByPk(id, {
            attributes: ['id', 'cid'],
            raw: true
        });

        if (!current) {
            return res.json({ code: -1, message: '文章不存在', articles: [] });
        }

        // ✅ include 改为数组 + 加 as
        const include = [
            {
                model: Category,
                as: 'Category',
                required: false,
                attributes: {
                    exclude: [
                        'seoTitle',
                        'seoKeywords',
                        'seoDescription',
                        'orderBy',
                        'listView',
                        'articleView'
                    ]
                }
            },
            {
                model: Tag,
                as: 'Tags',
                through: { attributes: [] },
                required: false,
                attributes: ['id', 'name', 'path']
            }
        ];

        // ✅ 不再用 literal 子查询，标签通过 include 得到
        const attributes = {
            exclude: ['subCid', 'articleView', 'source', 'status']
            // 不 exclude content，如需算 readTime 要保留
        };

        // 2. 查同栏目下的其他文章
        const { count, rows } = await Article.findAndCountAll({
            attributes,
            where: {
                status: 0,
                cid: current.cid,              // 同栏目
                id: { [Op.ne]: current.id }    // 排除自己
            },
            include,
            limit: Number(limit),
            order: [['createdAt', 'DESC']],
            distinct: true   // ✅ 避免 include 导致 count 不准
        });

        const result = rows.map(article => {
            const plain = article.toJSON();

            // Tags 是数组，不需要 JSON.parse
            // 只有 author 可能是 JSON 字符串
            if (plain.author && typeof plain.author === 'string') {
                try {
                    plain.author = JSON.parse(plain.author);
                } catch {
                    // 不是 JSON，保持原样
                }
            }

            // 如需计算阅读时长
            if (plain.content) {
                plain.readTime = calcReadTime(plain.content);
            }

            return plain;
        });

        res.json({ code: 1, message: 'Success', count, articles: result });
    } catch (error) {
        console.error('getRelatedArticlesById error:', error);
        res.json({ code: -1, message: error.message, articles: [] });
    }
}
async function getRelatedArticles(req, res, next) {
    try {
        const { limit = 3, id, cid, sort = 'latest' } = req.query;
        const page = 1;
        const offset = (page - 1) * Number(limit);

        if (!id || !cid) {
            return res.json({ code: -1, message: '缺少 id 或 cid 参数', count: 0, articles: [] });
        }

        // ✅ 只保留必要条件，去掉 tagId 非空判断（用中间表后不需要）
        const where = {
            status: 0,
            cid: cid,
            id: { [Op.ne]: id }
        };

        // ✅ include 改为数组 + 加 as
        const include = [
            {
                model: Category,
                as: 'Category',
                required: false,
                attributes: {
                    exclude: [
                        'seoTitle',
                        'seoKeywords',
                        'seoDescription',
                        'orderBy',
                        'listView',
                        'articleView'
                    ]
                }
            },
            {
                model: Tag,
                as: 'Tags',
                through: { attributes: [] },
                required: false,
                attributes: ['id', 'name', 'path']
            }
        ];

        // ✅ 排序规则
        const orderMap = {
            latest: [['createdAt', 'DESC']],
            oldest: [['createdAt', 'ASC']],
            popular: [['pv', 'DESC']],
            mostLiked: [['likes', 'DESC']]
        };
        const order = orderMap[sort] || orderMap.latest;

        // ✅ 不再用 literal 子查询，标签通过 include 得到
        const attributes = {
            exclude: ['subCid', 'articleView', 'source', 'status']
            // 不 exclude content，如需算 readTime 要保留
        };

        const { count, rows } = await Article.findAndCountAll({
            attributes,
            where,
            include,
            order,
            limit: Number(limit),
            offset,
            distinct: true   // ✅ 避免 include 导致 count 不准
        });

        const result = rows.map(article => {
            const plain = article.toJSON();

            // Tags 是数组，不需要 JSON.parse
            // 只有 author 可能是 JSON 字符串
            if (plain.author && typeof plain.author === 'string') {
                try {
                    plain.author = JSON.parse(plain.author);
                } catch {
                    // 不是 JSON，保持原样
                }
            }

            // 如需计算阅读时长
            if (plain.content) {
                plain.readTime = calcReadTime(plain.content);
            }

            return plain;
        });

        res.json({ code: 1, message: 'Articles retrieved successfully', count, articles: result });
    } catch (error) {
        console.error('Error in getRelatedArticles:', error);
        res.json({ code: -1, message: error.message, count: 0, articles: [] });
    }
}
module.exports = {
    test,
    getArticles,
    searchArticles,
    getPinnedArticles,
    getRecentArticles,
    getArticleById,
    getPopularArticles,
    getFeaturedArticles,
    getCategoryArticles,
    getArticlesByTag,
    getTagArticles,
    getRelatedArticles,
    getRelatedArticlesById,
    incrementViewCount,
    toggleLike,
    toggleBookmark,
};