const { Op } = require('sequelize');
const { Category, Article, ArticleTag  } = require('../models');

async function test(req, res, next) {
    res.json({ code: 200, message: 'Test successful' });
}

async function getArticles(req, res, next) {
    try {
        const { page = 1, limit = 10, categoryId, tagId } = req.query;
        const offset = (page - 1) * limit;
        let where = {};

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (tagId) {
            where.id = {
                [Op.in]: ArticleTag.findAll({
                    attributes: ['articleId'],
                    where: { tagId }
                }).then(results => results.map(r => r.articleId))
            };
        }

        const articles = await Article.findAndCountAll({
            where,
            limit,
            offset
        });

        res.json({ code: 200, message: 'Articles retrieved successfully', data: articles });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getArticles
};