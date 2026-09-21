
//const { Tag } = require('../models');
const ArticleController = require('./ArticleController');
const CategoryController = require('./CategoryController');
const TagController = require('./TagController');
const FragController = require('./FragController');
const SiteController = require('./SiteController');
const ImageController = require('./imageProxyController');

//exports.Article = ArticleController;

module.exports = {
    Article: ArticleController,
    Category: CategoryController,
    Tag: TagController,
    Frag: FragController,
    Site: SiteController,
    Image: ImageController
}