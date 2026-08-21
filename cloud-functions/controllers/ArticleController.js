const { Op } = require('sequelize');
const { Category, Article, ArticleTag, Tag } = require('../models');

async function test(req, res, next) {
    res.json({ code: 200, message: 'Test successful' });
}

async function getArticles(req, res, next) {
    try {
        const { page = 1, limit = 10, cid, tid } = req.query;
        const offset = (page - 1) * limit;
        let where = {};

        if (cid) {
            where.cid = cid;
        }

        if (tid) {
            where.id = {
                [Op.in]: await ArticleTag.findAll({
                    attributes: ['aid'],
                    where: { tid: { [Op.eq]: tid } }
                }).then(results => results.map(r => r.aid))
            };
        }

        const articles = await Article.findAndCountAll({ where, limit, offset });

        res.json({ code: 1, message: 'Articles retrieved successfully', data: articles });
    } catch (error) {
        next(error);
    }
}
async function getPinnedArticles(req, res, next) {
    try {
        const { limit = 1 } = req.params || req.query;
        const where = {
            attr: { [Op.like]: '%1%' },
            status: { [Op.eq]: 0 },
        };
        const order = [
            ['createdAt', 'DESC'],
        ];
        const result = await Article.findAll({
            where,
            limit,
            offset: 0,
            order
        });
        if (!result) {
            return res.status(404).json({ code: -1, message: 'Article not found' });
        }
        res.json({ code: 1, message: 'Article retrieved successfully', data: result[0] });
    } catch (error) {
        next(error);
    }
}
async function getArticleById(req, res, next) {
    try {
        const { id } = req.params || req.query;
        const article = await Article.findByPk(id);
        if (!article) {
            return res.status(404).json({ code: -1, message: 'Article not found' });
        }
        res.json({ code: 1, message: 'Article retrieved successfully', data: article });
    } catch (error) {
        next(error);
    }
}
async function getCategories(req, res, next) {
    try {
        const categories = await Category.findAll()
        res.json({ code: 1, message: 'Category retrieved successfully', data: categories });
    }
    catch (error) {
        return res.status(404).json({ code: -1, message: error.message });
    }
}
async function getTags(req, res, next) {
    try {
        const tags = await Tag.findAll()
        res.json({ code: 1, message: 'Category retrieved successfully', data: tags });
    }
    catch (error) {
        return res.status(404).json({ code: -1, message: error.message });
    }
}
module.exports = {
    getArticles,
    getPinnedArticles,
    getArticleById,
    getCategories,
    getTags
};