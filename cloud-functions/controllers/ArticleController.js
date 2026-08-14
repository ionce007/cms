const { Op } = require('sequelize');
const { Category, Article, ArticleTag  } = require('../models');

async function test(req, res, next) {
    res.json({ code: 200, message: 'Test successful' });
}

module.exports = {
    test
};