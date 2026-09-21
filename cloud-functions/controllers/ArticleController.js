const { Op } = require('sequelize');
import sequelize from '../common/db';  // 导入 sequelize 实例
const { Category, Article, ArticleTag, Tag } = require('../models');

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
                sequelize.where(sequelize.fn('LENGTH', sequelize.col('tagId')), { [Op.gt]: 0 })
            ]
        }

        if (cid) where.cid = cid;
        if (search) {
            where[Op.and].push({
                [Op.or]: [
                    { title: { [Op.like]: `%${search}%` } },
                    { content: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } },
                    // 栏目名称搜索（通过子查询）
                    sequelize.where(sequelize.literal(`(SELECT name FROM cms_category WHERE cms_category.id = Article.cid)`), { [Op.like]: `%${search}%` }),
                    // 标签名称搜索（通过子查询）
                    sequelize.where(sequelize.literal(`(SELECT GROUP_CONCAT(name) FROM cms_tag WHERE FIND_IN_SET(cms_tag.id, Article.tagId) > 0)`), { [Op.like]: `%${search}%` })
                ]
            });
        }
        const include = { model: Category, required: false }
        // 排序处理
        let order = [['createdAt', 'DESC']]; // 默认按创建时间倒序
        if (sort === 'latest') {
            order = [['createdAt', 'DESC']];
        } else if (sort === 'oldest') {
            order = [['createdAt', 'ASC']];
        } else if (sort === 'popular') {
            order = [['pv', 'DESC']];
        } else if (sort === 'mostLiked') {
            order = [['likes', 'DESC']];
        }
        const attributes = {
            include: [
                [sequelize.literal(`(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'name', name)) FROM cms_tag WHERE FIND_IN_SET(cms_tag.id, Article.tagId) > 0)`), 'tags']
            ]
        }
        const { count, rows } = await Article.findAndCountAll({ attributes, where, include, order, limit, offset });
        const result = rows.map(article => {
            const plain = article.toJSON();  // 虚拟字段自动计算

            // 处理 JSON_ARRAYAGG 返回的字符串
            if (plain.tags && typeof plain.tags === 'string') {
                plain.tags = JSON.parse(plain.tags);
            }

            if (plain.Category && typeof plain.Category === 'string') {
                plain.Category = JSON.parse(plain.Category);
            }
            if (plain.author && typeof plain.author === 'string') {
                plain.author = JSON.parse(plain.author);
            }
            return plain;
        });
        res.json({ code: 1, message: 'Articles retrieved successfully', count: count, data: result });
    } catch (error) {
        res.json({ code: -1, message: error.message, count: 0, data: [] });
    }
}
async function getCategoryArticles(req, res, next) {
    try {
        const contentType = req.get('content-type');
        const { page = 1, limit = 10, slug, sort } = req.body;
        const offset = (page - 1) * limit;
        let where = {
            status: 0,
            [Op.and]: [
                { tagId: { [Op.ne]: null } },
                sequelize.where(sequelize.fn('LENGTH', sequelize.col('tagId')), { [Op.gt]: 0 })
            ]
        }

        // 关联 Category，并添加 pinyin = slug 条件
        const include = {
            model: Category,
            required: true,  // 使用 INNER JOIN，确保只返回有匹配栏目的文章
            where: { pinyin: slug }, // 添加栏目查询条件
            //attributes: ['id', 'name', 'pinyin']  // 指定返回的栏目字段
        };

        const attributes = {
            include: [
                [sequelize.literal(`(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'name', name, 'path', path)) FROM cms_tag WHERE FIND_IN_SET(cms_tag.id, Article.tagId) > 0)`), 'tags']
            ]
        }
        let order = [['createdAt', 'DESC']]; // 默认按创建时间倒序
        if (sort === 'latest') {
            order = [['createdAt', 'DESC']];
        } else if (sort === 'oldest') {
            order = [['createdAt', 'ASC']];
        } else if (sort === 'popular') {
            order = [['pv', 'DESC']];
        } else if (sort === 'mostLiked') {
            order = [['likes', 'DESC']];
        }

        const { count, rows } = await Article.findAndCountAll({ attributes, where, include, order, limit, offset });
        const result = rows.map(article => {
            const plain = article.toJSON();  // 虚拟字段自动计算

            // 处理 JSON_ARRAYAGG 返回的字符串
            if (plain.tags && typeof plain.tags === 'string') {
                plain.tags = JSON.parse(plain.tags);
            }

            if (plain.Category && typeof plain.Category === 'string') {
                plain.Category = JSON.parse(plain.Category);
            }
            if (plain.author && typeof plain.author === 'string') {
                plain.author = JSON.parse(plain.author);
            }
            return plain;
        });
        res.json({ code: 1, message: 'Articles retrieved successfully', count: count, data: result });
    } catch (error) {
        console.error('Error in getCategoryArticles:', error);
        res.json({ code: -1, message: error.message, count: 0, data: [] });
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
            return res.json({ code: 1, message: '标签不存在', count: 0, data: [] });
        }
        const tagId = tag.id;
        const attributes = {
            include: [
                [sequelize.literal(`(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'name', name, 'path', path)) FROM cms_tag WHERE FIND_IN_SET(cms_tag.id, Article.tagId) > 0)`), 'tags']
            ]
        }
        // ✅ 构建排序规则
        const orderMap = {
            latest: [['createdAt', 'DESC']],
            oldest: [['createdAt', 'ASC']],
            popular: [['pv', 'DESC']],
            likes: [['likes', 'DESC']],
        };
        const order = orderMap[sort] || orderMap.latest;

        // ✅ 查询文章：tagId 是逗号分隔字符串，用 FIND_IN_SET
        /*const { count, rows } = await Article.findAndCountAll({
            attributes,
            where: {
                status: 0,  // ✅ 只查询已发布的文章
                [Op.and]: sequelize.where(
                    sequelize.fn('FIND_IN_SET', tagId, sequelize.col('tagId')),
                    { [Op.gt]: 0 }
                ),
            },
            include: [{ model: Category, required: false }],
            limit: limitNum,
            offset,
            order,
        });*/
        // ✅ 查询文章：tagId 是逗号分隔字符串，用 FIND_IN_SET
        const { count, rows } = await Article.findAndCountAll({
            attributes: {
                include: [
                    [
                        sequelize.literal(`(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'name', name, 'path', path)) FROM cms_tag WHERE FIND_IN_SET(cms_tag.id, Article.tagId) > 0)`), 'tags'
                    ]
                ]
            },
            where: {
                status: 0,
                [Op.and]: sequelize.where(
                    sequelize.fn('FIND_IN_SET', String(tagId), sequelize.col('tagId')),
                    { [Op.gt]: 0 }
                ),
            },
            include: [{ model: Category, required: false }],
            limit: limitNum,
            offset,
            order,
            distinct: true,  // ✅ 避免 include 导致 count 不准
        });

        const result = rows.map(article => {
            const plain = article.toJSON();  // 虚拟字段自动计算

            // 处理 JSON_ARRAYAGG 返回的字符串
            if (plain.tags && typeof plain.tags === 'string') {
                plain.tags = JSON.parse(plain.tags);
            }

            if (plain.Category && typeof plain.Category === 'string') {
                plain.Category = JSON.parse(plain.Category);
            }
            if (plain.author && typeof plain.author === 'string') {
                plain.author = JSON.parse(plain.author);
            }
            return plain;
        });
        // ✅ 格式化返回数据
        //const data = rows.map(article => formatArticle(article));
        res.json({ code: 1, message: 'Articles retrieved successfully', count, data: result });
    } catch (error) {
        console.error('getTagArticles error:', error);
        res.json({ code: -1, message: error.message, count: 0, data: [], });
    }
}
async function searchArticles(req, res, next) {
    try {
        const contentType = req.get('content-type');
        const { page = 1, limit = 10, category, tag, search, sort } = req.body;
        const offset = (page - 1) * limit;
        let where = {
            status: 0,
            [Op.and]: [
                { tagId: { [Op.ne]: null } },
                sequelize.where(sequelize.fn('LENGTH', sequelize.col('tagId')), { [Op.gt]: 0 }),
            ]
        }

        if (category) where.cid = category;
        if (search) {
            where[Op.and].push({
                [Op.or]: [
                    { title: { [Op.like]: `%${search}%` } },
                    { content: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } }
                ]
            });
        }
        const include = { model: Category, required: false }
        if (tag) {
            where[Op.and].push(
                sequelize.where(
                    sequelize.fn('FIND_IN_SET', String(tag), sequelize.col('tagId')),
                    { [Op.gt]: 0 }
                )
            );
        }
        const attributes = {
            include: [
                [sequelize.literal(`(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'name', name, 'path', path)) FROM cms_tag WHERE FIND_IN_SET(cms_tag.id, Article.tagId) > 0)`), 'tags']
            ]
        }
        // 排序处理
        let order = [['createdAt', 'DESC']]; // 默认按创建时间倒序
        if (sort === 'latest') {
            order = [['createdAt', 'DESC']];
        } else if (sort === 'oldest') {
            order = [['createdAt', 'ASC']];
        } else if (sort === 'popular') {
            order = [['pv', 'DESC']];
        } else if (sort === 'mostLiked') {
            order = [['likes', 'DESC']];
        }
        const { count, rows } = await Article.findAndCountAll({ attributes, where, include, order, limit, offset });
        const result = rows.map(article => {
            const plain = article.toJSON();  // 虚拟字段自动计算

            // 处理 JSON_ARRAYAGG 返回的字符串
            if (plain.tags && typeof plain.tags === 'string') {
                plain.tags = JSON.parse(plain.tags);
            }

            if (plain.Category && typeof plain.Category === 'string') {
                plain.Category = JSON.parse(plain.Category);
            }
            if (plain.author && typeof plain.author === 'string') {
                plain.author = JSON.parse(plain.author);
            }
            return plain;
        });
        res.json({ code: 1, message: 'Articles retrieved successfully', count: count, data: result });
    } catch (error) {
        console.error('Error in searchArticles:', error);
        res.json({ code: -1, message: error.message, count: 0, data: [] });
    }
}
async function getRecentArticles(req, res, next) {
    try {
        const { page = 1, limit = 6 } = req.query;
        const offset = 0;
        const where = { status: { [Op.eq]: 0 } };
        const order = [['createdAt', 'DESC']];

        const include = { model: Category, required: false }
        const articles = await Article.findAll({
            attributes: {
                include: [
                    [
                        sequelize.literal(`(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'name', name)) FROM cms_tag WHERE FIND_IN_SET(cms_tag.id, Article.tagId) > 0)`), 'tags'
                    ]
                ]
            },
            where, include, limit, offset, order
        });
        const result = articles.map(article => {
            const plain = article.toJSON();  // 虚拟字段自动计算

            // 处理 JSON_ARRAYAGG 返回的字符串
            if (plain.tags && typeof plain.tags === 'string') {
                plain.tags = JSON.parse(plain.tags);
            }

            if (plain.Category && typeof plain.Category === 'string') {
                plain.Category = JSON.parse(plain.Category);
            }
            if (plain.author && typeof plain.author === 'string') {
                plain.author = JSON.parse(plain.author);
            }
            return plain;
        });
        res.json({ code: 1, message: 'Articles retrieved successfully', count: articles.length, data: result });
    } catch (error) {
        res.json({ code: -1, message: error.message, data: null });
    }
}
async function getPinnedArticles(req, res, next) {
    try {
        const { limit = 1 } = req.params || req.query;
        const where = {
            //attr: { [Op.and]: [{ [Op.like]: '%1%' }, { [Op.like]: '%2%' }] },
            status: { [Op.eq]: 0 },
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
        const order = [
            ['createdAt', 'DESC'],
        ];
        const include = { model: Category, required: false }
        const attributes = {
            include: [
                [
                    sequelize.literal(`(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'name', name,'path', path)) FROM cms_tag WHERE FIND_IN_SET(cms_tag.id, Article.tagId) > 0)`), 'tags'
                ]
            ]
        }
        const articles = await Article.findAll({
            attributes,
            where,
            include,
            limit,
            offset: 0,
            order,
        });
        if (!articles) {
            return res.status(404).json({ code: -1, message: 'Article not found' });
        }
        const result = articles.map(article => {
            const plain = article.toJSON();  // 虚拟字段自动计算

            // 处理 JSON_ARRAYAGG 返回的字符串
            if (plain.tags && typeof plain.tags === 'string') {
                plain.tags = JSON.parse(plain.tags);
            }
            if (plain.Category && typeof plain.Category === 'string') {
                plain.Category = JSON.parse(plain.Category);
            }
            if (plain.author && typeof plain.author === 'string') {
                plain.author = JSON.parse(plain.author);
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
        //const article = await Article.findByPk(id);
        const where = { id: id };
        const include = { model: Category, required: false }
        const article = await Article.findOne({
            attributes: {
                include: [
                    [
                        sequelize.literal(`(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'name', name,'path',path)) FROM cms_tag WHERE FIND_IN_SET(cms_tag.id, Article.tagId) > 0)`), 'tags'
                    ]
                ]
            },
            where, include
        });
        if (!article) {
            return res.status(404).json({ code: -1, message: 'Article not found' });
        }
        const plain = article.toJSON();  // 虚拟字段自动计算

        // 处理 JSON_ARRAYAGG 返回的字符串
        if (plain.tags && typeof plain.tags === 'string') {
            plain.tags = JSON.parse(plain.tags);
        }
        if (plain.Category && typeof plain.Category === 'string') {
            plain.Category = JSON.parse(plain.Category);
        }
        if (plain.author && typeof plain.author === 'string') {
            plain.author = JSON.parse(plain.author);
        }
        res.json({ code: 1, message: 'Article retrieved successfully', article: plain });
    } catch (error) {
        next(error);
    }
}
async function getPopularArticles(req, res, next) {
    try {
        const { page = 1, limit = 5 } = req.query;
        const offset = (page - 1) * limit;
        const where = { status: { [Op.eq]: 0 } };
        const order = [['pv', 'DESC'], ['createdAt', 'DESC']];
        const include = { model: Category, required: false }
        const attributes = {
            include: [
                [
                    sequelize.literal(`(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'name', name,'path', path)) FROM cms_tag WHERE FIND_IN_SET(cms_tag.id, Article.tagId) > 0)`), 'tags'
                ]
            ]
        }
        const articles = await Article.findAll({ where, attributes, include, limit, offset, order });

        const result = articles.map(article => {
            const plain = article.toJSON();  // 虚拟字段自动计算

            // 处理 JSON_ARRAYAGG 返回的字符串
            if (plain.tags && typeof plain.tags === 'string') {
                plain.tags = JSON.parse(plain.tags);
            }
            if (plain.Category && typeof plain.Category === 'string') {
                plain.Category = JSON.parse(plain.Category);
            }
            if (plain.author && typeof plain.author === 'string') {
                plain.author = JSON.parse(plain.author);
            }
            return plain;
        });
        res.json({ code: 1, message: 'Articles retrieved successfully', data: result });
    } catch (error) {
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
            ],
        };
        const order = [
            ['createdAt', 'DESC'],
        ];
        const include = { model: Category, required: false }
        const attributes = {
            include: [
                [
                    sequelize.literal(`(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'name', name,'path', path)) FROM cms_tag WHERE FIND_IN_SET(cms_tag.id, Article.tagId) > 0)`), 'tags'
                ]
            ]
        }
        const articles = await Article.findAll({ attributes, where, include, limit, offset: 0, order });
        if (!articles) {
            return res.status(404).json({ code: -1, message: 'Article not found' });
        }
        const result = articles.map(article => {
            const plain = article.toJSON();  // 虚拟字段自动计算

            // 处理 JSON_ARRAYAGG 返回的字符串
            if (plain.tags && typeof plain.tags === 'string') {
                plain.tags = JSON.parse(plain.tags);
            }
            if (plain.Category && typeof plain.Category === 'string') {
                plain.Category = JSON.parse(plain.Category);
            }
            if (plain.author && typeof plain.author === 'string') {
                plain.author = JSON.parse(plain.author);
            }
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
        const where = {
            id: {
                [Op.in]: await ArticleTag.findAll({
                    attributes: ['aid'],
                    where: { tid: { [Op.eq]: tid } }
                }).then(results => results.map(r => r.aid))
            },
            status: { [Op.eq]: 0 }
        };
        const include = { model: Category, required: false }
        const attributes = {
            include: [
                [
                    sequelize.literal(`(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'name', name,'path', path)) FROM cms_tag WHERE FIND_IN_SET(cms_tag.id, Article.tagId) > 0)`), 'tags'
                ]
            ]
        }
        const { count, rows } = await Article.findAndCountAll({ attributes, where, include, limit, offset });
        const result = rows.map(article => {
            const plain = article.toJSON();  // 虚拟字段自动计算

            // 处理 JSON_ARRAYAGG 返回的字符串
            if (plain.tags && typeof plain.tags === 'string') {
                plain.tags = JSON.parse(plain.tags);
            }
            if (plain.Category && typeof plain.Category === 'string') {
                plain.Category = JSON.parse(plain.Category);
            }
            if (plain.author && typeof plain.author === 'string') {
                plain.author = JSON.parse(plain.author);
            }
            return plain;
        });
        res.json({ code: 1, message: 'Articles retrieved successfully', count: count, data: rows });
    } catch (error) {
        res.json({ code: -1, message: error.message, count: 0, data: [] });
    }
}
async function getRelatedArticlesById(req, res, next) {
    try {
        const { id } = req.params;
        const { limit = 3 } = req.query;
        console.log('id = ', id)
        // 1. 先查出当前文章
        const current = await Article.findByPk(id, { attributes: ['id', 'cid', 'tagId'], raw: true });

        if (!current) {
            return res.json({ code: -1, message: '文章不存在', articles: [] });
        }
        const attributes = {
            include: [
                [sequelize.literal(`(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'name', name)) FROM cms_tag WHERE FIND_IN_SET(cms_tag.id, Article.tagId) > 0)`), 'tags']
            ]
        }
        // 2. 查同栏目下的其他文章
        const { count, rows } = await Article.findAndCountAll({
            where: {
                status: 0,
                cid: current.cid,          // 同栏目
                id: { [Op.ne]: current.id } // 排除自己
            },
            limit: Number(limit),
            order: [['createdAt', 'DESC']],
            attributes: attributes,//['id', 'title', 'img', 'description', 'createdAt', 'pv', 'likes'],
            include: [{ model: Category, required: false }],
        });
        const result = rows.map(article => {
            const plain = article.toJSON();  // 虚拟字段自动计算

            // 处理 JSON_ARRAYAGG 返回的字符串
            if (plain.tags && typeof plain.tags === 'string') {
                plain.tags = JSON.parse(plain.tags);
            }
            if (plain.Category && typeof plain.Category === 'string') {
                plain.Category = JSON.parse(plain.Category);
            }
            if (plain.author && typeof plain.author === 'string') {
                plain.author = JSON.parse(plain.author);
            }
            return plain;
        });
        res.json({
            code: 1,
            message: 'Success',
            count: count,
            articles: result
        });
    } catch (error) {
        console.error('getRelatedArticlesById error:', error);
        res.json({ code: -1, message: error.message, articles: [] });
    }
}
async function getRelatedArticles(req, res, next) {
    try {
        const { limit = 3, id, cid, sort = 'latest' } = req.query;
        const page = 1;
        const offset = (page - 1) * limit;
        let where = {
            status: 0,
            cid: cid,
            id: { [Op.ne]: id },
            [Op.and]: [
                { tagId: { [Op.ne]: null } },
                sequelize.where(sequelize.fn('LENGTH', sequelize.col('tagId')), { [Op.gt]: 0 })
            ]
        };

        const include = { model: Category, required: false }
        // 排序处理
        let order = [['createdAt', 'DESC']]; // 默认按创建时间倒序
        if (sort === 'latest') {
            order = [['createdAt', 'DESC']];
        } else if (sort === 'oldest') {
            order = [['createdAt', 'ASC']];
        } else if (sort === 'popular') {
            order = [['pv', 'DESC']];
        } else if (sort === 'mostLiked') {
            order = [['likes', 'DESC']];
        }
        const attributes = {
            include: [
                [sequelize.literal(`(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'name', name)) FROM cms_tag WHERE FIND_IN_SET(cms_tag.id, Article.tagId) > 0)`), 'tags']
            ]
        }
        const { count, rows } = await Article.findAndCountAll({ attributes, where, include, order, limit, offset });
        const result = rows.map(article => {
            const plain = article.toJSON();  // 虚拟字段自动计算

            // 处理 JSON_ARRAYAGG 返回的字符串
            if (plain.tags && typeof plain.tags === 'string') {
                plain.tags = JSON.parse(plain.tags);
            }
            if (plain.Category && typeof plain.Category === 'string') {
                plain.Category = JSON.parse(plain.Category);
            }
            if (plain.author && typeof plain.author === 'string') {
                plain.author = JSON.parse(plain.author);
            }
            return plain;
        });
        res.json({ code: 1, message: 'Articles retrieved successfully', count: count, articles: result });
    } catch (error) {
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
    getRelatedArticlesById
};