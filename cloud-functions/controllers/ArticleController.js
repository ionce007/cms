const { Op } = require('sequelize');
import sequelize from '../common/db';  // 导入 sequelize 实例
const { Category, Article, Tag, MemberLike, MemberBookmark } = require('../models');
import { calcReadTime } from '../common/utils';


//import { getAllCategories, getAllTags, getAllFrags, getSiteConfig, filterByIds } from './cache/DataCache';

async function test(req, res, next) {
    //const siteInfo = await getSiteConfig();
    //return res.json({ site: siteInfo });
    /*
    const categories = await getAllCategories();
    const tags = await getAllTags();
    const frags = await getAllFrags();
    const site = await getSiteConfig();
    res.json({ code: 1, message: 'success', data: { categories, tags, frags, site } });
    */
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
            //distinct: true
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
            //distinct: true   // ✅ 避免 include 导致 count 不准
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
            //distinct: true
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
async function searchArticlesTest(req, res, next) {
    const start = Date.now();
    let data = {};
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
        const attributes = { exclude: ['subCid', 'articleView', 'source', 'status', 'content'] };
        const { count, rows } = await Article.findAndCountAll({
            attributes,
            where,
            //include,
            order,
            limit,
            offset,
            //distinct: true   // ✅ 避免 include 导致 count 不准
        });


        const categories = await getAllCategories();
        const allTags = await getAllTags();

        const result = rows.map(article => {
            const plain = article.toJSON();
            const category = categories.find(x => x.id === plain.cid);
            plain.Category = category;
            const tags = filterByIds(allTags, plain.tagId);
            plain.Tags = tags;
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
        const end = Date.now();
        const diff = end - start;  // 毫秒
        data = { code: 1, diff: diff, message: 'Articles retrieved successfully', count, data: result };
        //res.json({ code: 1, message: 'Articles retrieved successfully', count, data: result });
    } catch (error) {
        console.error('Error in searchArticles:', error);
        const end = Date.now();
        const diff = end - start;  // 毫秒
        data = { code: -1, diff: diff, message: error.message, count: 0, data: [] };
        //res.json({ code: -1, message: error.message, count: 0, data: [] });
    }
    finally {
        return res.json(data);
    }
}
async function searchArticles(req, res, next) {
    const start = Date.now();
    let data = {};
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
            exclude: ['subCid', 'articleView', 'source', 'status'] //, 'content']
        };

        const { count, rows } = await Article.findAndCountAll({
            attributes,
            where,
            include,
            order,
            limit,
            offset,
            //distinct: true   // ✅ 避免 include 导致 count 不准
        });

        /*const result = rows.map(article => {
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
        });*/

        // ✅ 批量查询当前用户的点赞/收藏状态
        const userId = req.user ? req.user.toJSON().id : null;

        let likedSet = new Set();
        let bookmarkedSet = new Set();
        if (userId && rows.length > 0) {
            const articleIds = rows.map(a => a.id);

            const [likes, bookmarks] = await Promise.all([
                MemberLike.findAll({
                    where: {
                        memberId: userId,
                        targetType: 'article',
                        targetId: { [Op.in]: articleIds },
                    },
                    attributes: ['targetId'],
                }),
                MemberBookmark.findAll({
                    where: {
                        memberId: userId,
                        targetType: 'article',
                        targetId: { [Op.in]: articleIds },
                    },
                    attributes: ['targetId'],
                }),
            ]);

            likedSet = new Set(likes.map(l => Number(l.targetId)));
            bookmarkedSet = new Set(bookmarks.map(b => Number(b.targetId)));
        }
        // ✅ 拼接返回
        const result = rows.map(article => {
            let plain = article.toJSON();
            // 先触发 readTime 计算
            plain.readTime = article.readTime;
            // 再删除 content
            delete plain.content;
            plain.isLiked = likedSet.has(article.id);
            plain.isBookmarked = bookmarkedSet.has(article.id);
            return plain;
        });
        const end = Date.now();
        const diff = end - start;  // 毫秒
        data = { code: 1, diff: diff, message: 'Articles retrieved successfully', count, data: result };
        //res.json({ code: 1, message: 'Articles retrieved successfully', count, data: result });
    } catch (error) {
        console.error('Error in searchArticles:', error);
        const end = Date.now();
        const diff = end - start;  // 毫秒
        data = { code: -1, diff: diff, message: error.message, count: 0, data: [] };
        //res.json({ code: -1, message: error.message, count: 0, data: [] });
    }
    finally {
        return res.json(data);
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
            //distinct: true,   // ✅ 避免 include 导致条数重复，
            //logging: console.log,   // 打印 SQL
            //benchmark: true         // 打印耗时
        });

        const userId = req.user ? req.user.toJSON().id : null;

        let likedSet = new Set();
        let bookmarkedSet = new Set();
        if (userId && articles.length > 0) {
            const articleIds = articles.map(a => a.id);

            const [likes, bookmarks] = await Promise.all([
                MemberLike.findAll({
                    where: {
                        memberId: userId,
                        targetType: 'article',
                        targetId: { [Op.in]: articleIds },
                    },
                    attributes: ['targetId'],
                }),
                MemberBookmark.findAll({
                    where: {
                        memberId: userId,
                        targetType: 'article',
                        targetId: { [Op.in]: articleIds },
                    },
                    attributes: ['targetId'],
                }),
            ]);

            likedSet = new Set(likes.map(l => l.targetId));
            bookmarkedSet = new Set(bookmarks.map(b => b.targetId));
        }
        /*const result = articles.map(article => {
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
        });*/

        const result = articles.map(article => {
            const plain = article.toJSON();
            // 先触发 readTime 计算
            plain.readTime = article.readTime;
            // 再删除 content
            delete plain.content;
            plain.isLiked = likedSet.has(article.id);
            plain.isBookmarked = bookmarkedSet.has(article.id);
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
            //distinct: true   // ✅ 避免 include 导致条数重复
        });

        // ✅ 空数组判断（不是 !articles）
        if (!articles || articles.length === 0) {
            return res.status(404).json({ code: -1, message: 'Article not found' });
        }

        /*const result = articles.map(article => {
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
        });*/
        const result = articles[0].toJSON()
        const userId = req.user ? req.user.toJSON().id : null;
        
        let likedSet = new Set();
        let bookmarkedSet = new Set();
        const articleId = result.id;
        if (userId) {
            const [likes, bookmarks] = await Promise.all([
                MemberLike.findAll({
                    where: {
                        memberId: userId,
                        targetType: 'article',
                        targetId: articleId,
                    },
                    attributes: ['targetId'],
                }),
                MemberBookmark.findAll({
                    where: {
                        memberId: userId,
                        targetType: 'article',
                        targetId: articleId,
                    },
                    attributes: ['targetId'],
                }),
            ]);

            likedSet = new Set(likes.map(l => l.targetId));
            bookmarkedSet = new Set(bookmarks.map(b => b.targetId));
        }
        result.isLiked = likedSet.has(articleId);
        result.isBookmarked = bookmarkedSet.has(articleId);
        result.readTime = calcReadTime(result.content);
        delete result.content
        res.json({ code: 1, message: 'Article retrieved successfully', data: result });
    } catch (error) {
        console.log('error = ', error);
        next(error);
    }
}
async function getArticleById(req, res, next) {
    try {
        const { id } = req.params || req.query;
        if (!id) return res.status(404).json({ code: -1, message: '缺少参数' });
        const userId = req.user ? req.user.toJSON().id : null;  // ✅ 从 optionalAuth 中间件获取

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

        const article = await Article.findByPk(id, {
            attributes,
            //where,
            include,
            //distinct: true
        });

        if (!article) {
            return res.status(404).json({ code: -1, message: 'Article not found' });
        }

        const plain = article.toJSON();

        // 2. ✅ 计算 isLiked 和 isBookmarked（仅登录用户）
        let isLiked = false;
        let isBookmarked = false;
        if (userId) {
            // ✅ 并行查询关联表
            const [likeRecord, bookmarkRecord] = await Promise.all([
                MemberLike.findOne({
                    where: {
                        memberId: userId,
                        targetType: 'article',
                        targetId: id,
                    },
                    attributes: ['id'],  // 只查 ID，减少数据传输
                    raw: true,
                }),
                MemberBookmark.findOne({
                    where: {
                        memberId: userId,
                        targetType: 'article',
                        targetId: id,
                    },
                    attributes: ['id'],
                    raw: true,
                }),
            ]);
            isLiked = !!likeRecord;
            isBookmarked = !!bookmarkRecord;
        }
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
        const data = { ...plain, isLiked, isBookmarked, }
        res.json({ code: 1, message: 'Article retrieved successfully', article: data });
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
 * 文章点赞/取消点赞（需登录）
 * POST /api/articles/:id/like
 */
async function toggleLike(req, res) {
    try {
        const { id } = req.params;
        const { action = 'like' } = req.body;
        const userId = req.user ? req.user.toJSON().id : null;
        // ✅ 必须登录
        if (!userId) {
            return res.status(401).json({ code: 401, message: '请先登录', });
        }

        const article = await Article.findByPk(id, {
            attributes: ['id', 'likes'],
        });

        if (!article) {
            return res.json({ code: -1, message: '文章不存在' });
        }

        // ✅ 检查是否已点赞
        const existing = await MemberLike.findOne({
            where: { memberId: userId, targetType: 'article', targetId: id },
        });

        if (action === 'unlike') {
            // 取消点赞
            if (existing) {
                await existing.destroy();
                await Article.decrement('likes', { where: { id } });
            }
        } else {
            // 点赞
            if (existing) {
                const data = { id: existing.id, likes: article.likes, isLiked: action !== 'unlike', }
                return res.json({ code: 2, message: '您已点过赞啦！', data: data });
            }

            await MemberLike.create({
                memberId: userId,
                targetType: 'article',
                targetId: id,
            });

            await Article.increment('likes', { where: { id } });
        }

        // 返回最新
        const updated = await Article.findByPk(id, {
            attributes: ['id', 'likes'],
        });

        res.json({ code: 1, message: 'success', data: { id: updated.id, likes: updated.likes, isLiked: action !== 'unlike', }, });
    } catch (error) {
        console.error('toggleLike error:', error);
        res.json({ code: -1, message: error.message });
    }
}
/**
 * 文章收藏/取消收藏（需登录）
 * POST /api/articles/:id/bookmark
 */
async function toggleBookmark(req, res) {
    try {
        const { id } = req.params;
        const { action = 'bookmark' } = req.body;
        const userId = req.user ? req.user.toJSON().id : null;

        // ✅ 必须登录
        if (!userId) {
            return res.status(401).json({ code: 401, message: '请先登录', });
        }

        const article = await Article.findByPk(id, {
            attributes: ['id', 'marked'],
        });

        if (!article) {
            return res.json({ code: -1, message: '文章不存在' });
        }

        const existing = await MemberBookmark.findOne({
            where: { memberId: userId, targetType: 'article', targetId: id },
        });

        if (action === 'unbookmark') {
            if (existing) {
                await existing.destroy();
                await Article.decrement('marked', { where: { id } });
            }
        } else {
            if (existing) {
                return res.json({ code: -1, message: '已收藏' });
            }

            await MemberBookmark.create({
                memberId: userId,
                targetType: 'article',
                targetId: id,
            });

            await Article.increment('marked', { where: { id } });
        }

        const updated = await Article.findByPk(id, {
            attributes: ['id', 'marked'],
        });

        res.json({ code: 1, message: 'success', data: { id: updated.id, marked: updated.marked, isBookmarked: action !== 'unbookmark', }, });
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
            //distinct: true   // ✅ 避免 include 导致条数重复
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
            //distinct: true   // 避免 include 导致条数不准
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
            //distinct: true   // ✅ 避免 include 导致 count 不准
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
            //distinct: true   // ✅ 避免 include 导致 count 不准
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
            //distinct: true   // ✅ 避免 include 导致 count 不准
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
    searchArticlesTest,
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